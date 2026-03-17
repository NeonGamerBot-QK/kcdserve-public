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

      # POST /api/v1/service_hours
      # Creates a new service hour submission for the authenticated user.
      # Expects multipart/form-data with service_hour[category] as a name string.
      def create
        category = Category.find_by("LOWER(name) = ?", params[:service_hour][:category]&.downcase)
        unless category
          render json: { errors: ["Category not found"] }, status: :unprocessable_entity
          return
        end

        hour = current_user.service_hours.build(service_hour_params)
        hour.category = category

        if hour.save
          render json: { service_hour: hour_json(hour) }, status: :created
        else
          render json: { errors: hour.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def service_hour_params
        params.require(:service_hour).permit(
          :description, :service_date, :hours, :organization_name, :location,
          :group_id, :contact_name, :contact_email, :title, :on_campus,
          photos: []
        )
      end

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
