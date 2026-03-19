# frozen_string_literal: true

module Api
  module V1
    class DashboardController < BaseController
      # GET /api/v1/dashboard
      # Returns stats, group progress, featured opportunities, and notification count.
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

        featured = Opportunity.published.upcoming.includes(:category, :opportunity_signups).limit(5)

        render json: {
          approved_hours: approved_hours,
          pending_hours: pending_hours,
          groups: groups,
          unread_notifications_count: user.notifications.unread.count,
          featured_opportunities: featured.map { |o| opportunity_summary(o) }
        }, status: :ok
      end

      private

      def opportunity_summary(opportunity)
        {
          id: opportunity.id,
          title: opportunity.title,
          date: opportunity.date.iso8601,
          location: opportunity.location,
          category: opportunity.category&.name,
          spots_remaining: opportunity.spots_remaining,
          full: opportunity.full?,
          signed_up: opportunity.opportunity_signups.any? { |s| s.user_id == current_user.id }
        }
      end
    end
  end
end
