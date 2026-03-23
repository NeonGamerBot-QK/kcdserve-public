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
      Rails.logger.error "OmniAuth failure: #{failure_message}"
      Rails.logger.error "OmniAuth origin: #{request.env['omniauth.origin']}"
      Rails.logger.error "OmniAuth error: #{request.env['omniauth.error'].inspect}"
      Rails.logger.error "OmniAuth strategy: #{request.env['omniauth.error.strategy']&.name}"
      redirect_to root_path, alert: "Authentication failed: #{failure_message}"
    end
  end
end
