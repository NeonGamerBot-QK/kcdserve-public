# frozen_string_literal: true

module Api
  module V1
    class BaseController < ActionController::API
      before_action :authenticate_api_user!

      private

      # Authenticates the user via Bearer token from the Authorization header.
      # Returns 401 if the token is missing, invalid, or expired.
      def authenticate_api_user!
        token = request.headers["Authorization"]&.remove("Bearer ")
        if token.blank?
          render json: { error: "Missing authorization token" }, status: :unauthorized
          return
        end

        @current_user = User.find_by(api_token: token)
        if @current_user.nil? || @current_user.api_token_expires_at < Time.current
          render json: { error: "Invalid or expired token" }, status: :unauthorized
        end
      end

      def current_user
        @current_user
      end
    end
  end
end
