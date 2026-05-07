# frozen_string_literal: true

module Users
  # Handles OmniAuth callback responses for social authentication
  class OmniauthCallbacksController < Devise::OmniauthCallbacksController
    # Processes the Google OAuth2 callback and signs in or creates the user
    def google_oauth2
      @user = User.from_omniauth(request.env["omniauth.auth"])

      if @user.persisted?
        sign_in_and_redirect @user, event: :authentication
        set_flash_message(:notice, :success, kind: "Google") if is_navigational_format?
      else
        session["devise.google_data"] = request.env["omniauth.auth"].except(:extra)
        redirect_to new_user_registration_url
      end
    end

    def failure
      error = request.env["omniauth.error"]
      Rails.logger.error "OmniAuth failure: #{failure_message}"
      Rails.logger.error "OmniAuth origin: #{request.env['omniauth.origin']}"
      Rails.logger.error "OmniAuth error: #{error.inspect}"
      Rails.logger.error "OmniAuth backtrace: #{error&.backtrace&.first(15)&.join("\n")}"
      Rails.logger.error "OmniAuth strategy: #{request.env['omniauth.error.strategy']&.name}"
      # Diagnostics for session-loss CSRF failures (nil omniauth.state)
      Rails.logger.error "OmniAuth session keys: #{session.to_hash.keys.inspect}"
      Rails.logger.error "OmniAuth cookie names: #{request.cookies.keys.inspect}"
      redirect_to root_path, alert: "Authentication failed: #{failure_message}"
    end
  end
end
