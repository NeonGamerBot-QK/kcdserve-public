# frozen_string_literal: true

module Admin
  # Admin dashboard with reporting and analytics overview
  class DashboardController < BaseController
    def index
      @total_users = User.count
      @total_hours = ServiceHour.approved.sum(:hours)
      @pending_reviews = ServiceHour.pending.count
      @total_opportunities = Opportunity.count

      @hours_by_month = ServiceHour.approved
        .group_by_month(:service_date, last: 12)
        .sum(:hours)

      @hours_by_category = ServiceHour.approved
        .joins(:category)
        .group("categories.name")
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
