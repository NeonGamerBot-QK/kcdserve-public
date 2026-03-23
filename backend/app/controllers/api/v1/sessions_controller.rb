# frozen_string_literal: true

module Api
  module V1
    class SessionsController < BaseController
      skip_before_action :authenticate_api_user!, only: [ :create, :verify, :google, :google_redirect, :google_callback ]

      # POST /api/v1/login
      # Accepts email, sends a 6-digit PIN to the user's email.
      def create
        user = User.find_by(email: params[:email]&.downcase&.strip)

        if user
          user.send_login_pin
        end

        # Always return 200 to avoid leaking whether the email exists
        render json: { message: "If that email exists, a login code has been sent." }, status: :ok
      end

      # POST /api/v1/login/verify
      # Accepts email + pin, creates a new session (30-day token).
      def verify
        user = User.find_by(email: params[:email]&.downcase&.strip)

        if user&.verify_login_pin(params[:pin])
          user.clear_login_pin!

          session = user.sessions.create!(
            token: SecureRandom.urlsafe_base64(48),
            expires_at: 30.days.from_now
          )

          render json: {
            token: session.token,
            expires_at: session.expires_at.iso8601,
            user: user_json(user)
          }, status: :ok
        else
          render json: { error: "Invalid or expired code" }, status: :unauthorized
        end
      end

      # POST /api/v1/login/google
      # Accepts a Google ID token from the mobile app, verifies it with Google,
      # finds or creates the user, and returns a session token.
      def google
        id_token = params[:id_token]
        if id_token.blank?
          render json: { error: "Missing id_token" }, status: :bad_request
          return
        end

        google_user = verify_google_id_token(id_token)
        if google_user.nil?
          render json: { error: "Invalid Google token" }, status: :unauthorized
          return
        end

        user = User.where(provider: "google_oauth2", uid: google_user[:sub]).first_or_create do |u|
          u.email = google_user[:email]
          u.password = Devise.friendly_token[0, 20]
          u.first_name = google_user[:given_name] || google_user[:name]&.split(" ")&.first || "User"
          u.last_name = google_user[:family_name] || google_user[:name]&.split(" ")&.last || ""
        end

        unless user.persisted?
          render json: { error: "Could not create account: #{user.errors.full_messages.join(', ')}" }, status: :unprocessable_entity
          return
        end

        session = user.sessions.create!(
          token: SecureRandom.urlsafe_base64(48),
          expires_at: 30.days.from_now
        )

        render json: {
          token: session.token,
          expires_at: session.expires_at.iso8601,
          user: user_json(user)
        }, status: :ok
      end

      # GET /api/v1/login/google/redirect
      # Mobile app opens this in a web browser. Redirects to Google's OAuth consent page.
      # The `scheme` param tells us how to deep-link back to the app afterwards.
      def google_redirect
        scheme = params[:scheme] || "kcd-mobile"
        state = Base64.urlsafe_encode64(JSON.generate({ scheme: scheme }), padding: false)
        callback_url = google_oauth_callback_url
        Rails.logger.info("[GoogleOAuth] redirect_uri=#{callback_url}")

        auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + {
          client_id: ENV["GOOGLE_CLIENT_ID"],
          redirect_uri: callback_url,
          response_type: "code",
          scope: "openid email profile",
          state: state,
          access_type: "offline",
          prompt: "select_account"
        }.to_query

        redirect_to auth_url, allow_other_host: true
      end

      # GET /api/v1/login/google/callback
      # Google redirects here with an authorization code. We exchange it for user info,
      # create a session, then deep-link back to the mobile app with the token.
      def google_callback
        state = JSON.parse(Base64.urlsafe_decode64(params[:state])) rescue {}
        scheme = state["scheme"] || "kcd-mobile"

        code = params[:code]
        if code.blank?
          redirect_to "#{scheme}://auth/error?message=no_code", allow_other_host: true
          return
        end

        # Exchange authorization code for tokens
        token_response = exchange_google_code(code)
        if token_response.nil?
          redirect_to "#{scheme}://auth/error?message=token_exchange_failed", allow_other_host: true
          return
        end

        # Verify the ID token
        google_user = verify_google_id_token(token_response[:id_token])
        if google_user.nil?
          redirect_to "#{scheme}://auth/error?message=invalid_token", allow_other_host: true
          return
        end

        user = User.where(provider: "google_oauth2", uid: google_user[:sub]).first_or_create do |u|
          u.email = google_user[:email]
          u.password = Devise.friendly_token[0, 20]
          u.first_name = google_user[:given_name] || google_user[:name]&.split(" ")&.first || "User"
          u.last_name = google_user[:family_name] || google_user[:name]&.split(" ")&.last || ""
        end

        unless user.persisted?
          redirect_to "#{scheme}://auth/error?message=account_creation_failed", allow_other_host: true
          return
        end

        session = user.sessions.create!(
          token: SecureRandom.urlsafe_base64(48),
          expires_at: 30.days.from_now
        )

        callback_params = {
          token: session.token,
          expires_at: session.expires_at.iso8601,
          user_id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role
        }.to_query

        redirect_to "#{scheme}://auth/success?#{callback_params}", allow_other_host: true
      end

      # DELETE /api/v1/logout
      # Destroys the current session only (other sessions stay active).
      def destroy
        current_session.destroy!
        render json: { message: "Logged out" }, status: :ok
      end

      private

      # Returns the Google OAuth callback URL.
      # Uses GOOGLE_OAUTH_CALLBACK_URL env var if set, otherwise derives from request.
      def google_oauth_callback_url
        ENV["GOOGLE_OAUTH_CALLBACK_URL"] || api_v1_google_callback_url
      end

      # Exchanges an authorization code for Google tokens (id_token, access_token).
      def exchange_google_code(code)
        uri = URI("https://oauth2.googleapis.com/token")
        response = Net::HTTP.post_form(uri, {
          code: code,
          client_id: ENV["GOOGLE_CLIENT_ID"],
          client_secret: ENV["GOOGLE_CLIENT_SECRET"],
          redirect_uri: google_oauth_callback_url,
          grant_type: "authorization_code"
        })

        return nil unless response.is_a?(Net::HTTPSuccess)

        JSON.parse(response.body, symbolize_names: true)
      rescue JSON::ParserError, Net::OpenTimeout, Net::ReadTimeout => e
        Rails.logger.error("Google code exchange failed: #{e.message}")
        nil
      end

      # Verifies a Google ID token by calling Google's tokeninfo endpoint.
      # Returns a hash with user info (:sub, :email, :name, etc.) or nil if invalid.
      def verify_google_id_token(token)
        uri = URI("https://oauth2.googleapis.com/tokeninfo?id_token=#{token}")
        response = Net::HTTP.get_response(uri)
        return nil unless response.is_a?(Net::HTTPSuccess)

        payload = JSON.parse(response.body, symbolize_names: true)

        # Verify the token was issued for our app
        expected_client_id = ENV["GOOGLE_CLIENT_ID"]
        if expected_client_id.present? && payload[:aud] != expected_client_id
          Rails.logger.warn("Google token audience mismatch: #{payload[:aud]}")
          return nil
        end

        payload
      rescue JSON::ParserError, Net::OpenTimeout, Net::ReadTimeout => e
        Rails.logger.error("Google token verification failed: #{e.message}")
        nil
      end

      def user_json(user)
        {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          total_approved_hours: user.total_approved_hours
        }
      end
    end
  end
end
