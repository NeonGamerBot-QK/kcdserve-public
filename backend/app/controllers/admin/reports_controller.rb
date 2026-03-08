# frozen_string_literal: true

module Admin
  # Generates reports and CSV exports for admin analytics
  class ReportsController < BaseController
    # Displays the main reports page with filters
    def index
      @date_range = parse_date_range

      @hours_scope = ServiceHour.approved.non_restitution
      @hours_scope = @hours_scope.by_date_range(@date_range[:start], @date_range[:end]) if @date_range[:start]

      @total_hours = @hours_scope.sum(:hours)
      @hours_by_category = @hours_scope.joins(:category).group("categories.name").sum(:hours)
      @hours_by_group = @hours_scope.where.not(group_id: nil).joins(:group).group("groups.name").sum(:hours)
      @monthly_trend = @hours_scope.group_by_month(:service_date, last: 12).sum(:hours)

      # Top volunteers ranked by non-restitution approved hours
      @top_volunteers = User.joins(:service_hours)
        .merge(@hours_scope)
        .group("users.id")
        .select("users.*, SUM(service_hours.hours) as total_hours")
        .order("total_hours DESC")
        .limit(25)
    end

    # Exports service hour data as CSV with optional date range filtering
    def export_csv
      scope = ServiceHour.approved.includes(:user, :category, :group, :opportunity)
      date_range = parse_date_range
      scope = scope.by_date_range(date_range[:start], date_range[:end]) if date_range[:start]
      scope = scope.order(service_date: :desc)

      csv_data = CSV.generate(headers: true) do |csv|
        csv << [
          "Volunteer", "Email", "Date", "Title", "Hours",
          "Category", "Group", "Opportunity", "On Campus",
          "Organization", "Contact Name", "Contact Email", "Description"
        ]
        scope.each do |sh|
          csv << [
            sh.user.full_name,
            sh.user.email,
            sh.service_date.to_s,
            sh.title,
            sh.hours.to_f,
            sh.category.name,
            sh.group&.name || "N/A",
            sh.opportunity&.title || "N/A",
            sh.on_campus? ? "Yes" : "No",
            sh.organization_name,
            sh.contact_name,
            sh.contact_email,
            sh.description
          ]
        end
      end

      send_data csv_data, filename: "service_hours_#{Date.current}.csv", type: "text/csv"
    end

    private

    # Parses start and end date from query parameters
    def parse_date_range
      {
        start: params[:start_date].present? ? Date.parse(params[:start_date]) : nil,
        end: params[:end_date].present? ? Date.parse(params[:end_date]) : nil
      }
    end
  end
end
