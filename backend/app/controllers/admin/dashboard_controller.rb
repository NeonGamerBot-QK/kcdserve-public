# frozen_string_literal: true

module Admin
  # Admin dashboard with reporting and analytics overview
  class DashboardController < BaseController
    def index
      @total_users = User.count
      @total_hours = ServiceHour.approved.sum(:hours)
      @pending_reviews = ServiceHour.pending.count
      @total_opportunities = Opportunity.count

      # Users who submitted approved service hours in the last 30 days
      @active_users = User.where(
        id: ServiceHour.approved
              .where(service_date: 30.days.ago.to_date..Date.current)
              .select(:user_id)
      ).count

      # Service hours by month (last 12 months)
      @hours_by_month = ServiceHour.approved
        .group_by_month(:service_date, last: 12)
        .sum(:hours)

      # Service hours broken down by category
      @hours_by_category = ServiceHour.approved
        .joins(:category)
        .group("categories.name")
        .sum(:hours)

      # Category breakdown: count of approved submissions per category
      @category_submission_counts = ServiceHour.approved
        .joins(:category)
        .group("categories.name")
        .count

      # Geolocation: approved service hours grouped by opportunity location
      @hours_by_location = ServiceHour.approved
        .joins(:opportunity)
        .where.not(opportunities: { location: [ nil, "" ] })
        .group("opportunities.location")
        .sum(:hours)

      @top_volunteers = User.joins(:service_hours)
        .where(service_hours: { status: :approved })
        .group("users.id")
        .select("users.*, SUM(service_hours.hours) as total_hours")
        .order("total_hours DESC")
        .limit(10)

      @recent_submissions = ServiceHour.pending.recent.includes(:user, :category).limit(10)
    end
  end
end
