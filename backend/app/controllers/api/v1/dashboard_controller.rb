# frozen_string_literal: true

module Api
  module V1
    class DashboardController < BaseController
      # GET /api/v1/dashboard
      # Returns stats and group progress for the authenticated user.
      def show
        user = current_user
        hours = user.service_hours

        pending_hours = hours.pending.sum(:hours).to_f
        approved_hours = user.total_approved_hours.to_f

        groups = user.groups.map do |group|
          user_hours_in_group = user.service_hours.approved.where(group: group).sum(:hours).to_f
          {
            id: group.id,
            name: group.name,
            current_hours: user_hours_in_group,
            total_approved_hours: group.total_approved_hours.to_f
          }
        end

        render json: {
          approved_hours: approved_hours,
          pending_hours: pending_hours,
          groups: groups
        }, status: :ok
      end
    end
  end
end
