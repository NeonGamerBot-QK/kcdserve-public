# frozen_string_literal: true

module Api
  module V1
    class ServiceHoursController < BaseController
      # GET /api/v1/service_hours
      # Returns the authenticated user's service hours, newest first.
      def index
        hours = current_user.service_hours.recent.includes(:category, :group)

        render json: {
          service_hours: hours.map { |h| hour_json(h) }
        }, status: :ok
      end

      private

      def hour_json(hour)
        {
          id: hour.id,
          title: hour.title,
          description: hour.description,
          organization_name: hour.organization_name,
          hours: hour.hours.to_f,
          status: hour.status,
          service_date: hour.service_date.iso8601,
          category: hour.category&.name,
          group: hour.group&.name,
          created_at: hour.created_at.iso8601
        }
      end
    end
  end
end
