# frozen_string_literal: true

module Api
  module V1
    class NotificationsController < BaseController
      # GET /api/v1/notifications
      # Returns paginated notifications for the current user, newest first.
      def index
        scope = current_user.notifications.recent
        scope = scope.unread if params[:unread] == "true"

        @pagy, notifications = pagy(:offset, scope, limit: params[:limit] || 20)

        render json: {
          notifications: notifications.map { |n| notification_json(n) },
          pagy: pagy_metadata(@pagy)
        }, status: :ok
      end

      # PATCH /api/v1/notifications/:id/read
      # Marks a single notification as read.
      def read
        notification = current_user.notifications.find(params[:id])
        notification.mark_as_read!

        render json: { notification: notification_json(notification) }, status: :ok
      end

      private

      def notification_json(notification)
        {
          id: notification.id,
          kind: notification.kind,
          title: notification.title,
          body: notification.body,
          read: notification.read_at.present?,
          read_at: notification.read_at&.iso8601,
          resource_type: notification.resource_type,
          resource_id: notification.resource_id,
          created_at: notification.created_at.iso8601
        }
      end

      def pagy_metadata(pagy)
        {
          page: pagy.page,
          pages: pagy.pages,
          count: pagy.count
        }
      end
    end
  end
end
