# frozen_string_literal: true

module Api
  module V1
    class SessionsController < BaseController
      skip_before_action :authenticate_api_user!, only: :create

      # POST /api/v1/login
      # Accepts email + password, returns a 30-day API token.
      def create
        user = User.find_by(email: params[:email]&.downcase&.strip)

        if user&.valid_password?(params[:password])
          token = SecureRandom.urlsafe_base64(48)
          user.update!(api_token: token, api_token_expires_at: 30.days.from_now)

          render json: {
            token: token,
            expires_at: user.api_token_expires_at.iso8601,
            user: user_json(user)
          }, status: :ok
        else
          render json: { error: "Invalid email or password" }, status: :unauthorized
        end
      end

      # DELETE /api/v1/logout
      # Clears the API token for the current user.
      def destroy
        current_user.update!(api_token: nil, api_token_expires_at: nil)
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
