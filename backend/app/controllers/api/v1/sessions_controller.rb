# frozen_string_literal: true

module Api
  module V1
    class SessionsController < BaseController
      skip_before_action :authenticate_api_user!, only: [ :create, :verify ]

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

      # DELETE /api/v1/logout
      # Destroys the current session only (other sessions stay active).
      def destroy
        current_session.destroy!
        render json: { message: "Logged out" }, status: :ok
      end

      private

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
