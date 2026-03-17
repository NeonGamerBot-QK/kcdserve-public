# frozen_string_literal: true

module Api
  module V1
    class BaseController < ActionController::API
      include Pagy::Method

      before_action :authenticate_api_user!

      private

      # Authenticates the user via Bearer token from the Authorization header.
      # Looks up an active session and returns 401 if invalid or expired.
      def authenticate_api_user!
        token = request.headers["Authorization"]&.remove("Bearer ")
        if token.blank?
          render json: { error: "Missing authorization token" }, status: :unauthorized
          return
        end

        @current_session = Session.active.includes(:user).find_by(token: token)
        if @current_session.nil?
          render json: { error: "Invalid or expired token" }, status: :unauthorized
        end
      end

      def current_user
        @current_session&.user
      end

      def current_session
        @current_session
      end

      # Returns a full URL for an Active Storage attachment, or nil if not attached.
      def active_storage_url(attachment)
        return nil unless attachment.attached?

        Rails.application.routes.url_helpers.url_for(attachment)
      end
    end
  end
end
