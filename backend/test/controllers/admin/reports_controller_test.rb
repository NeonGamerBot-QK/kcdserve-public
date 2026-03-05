# frozen_string_literal: true

require "test_helper"

# Tests for admin reporting and CSV export functionality
class Admin::ReportsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = create(:user, :admin)
    @volunteer = create(:user)
    @category = create(:category)
  end

  # -- Authentication & Authorization --

  test "index redirects unauthenticated users to sign in" do
    get admin_reports_path

    assert_redirected_to new_user_session_path
  end

  test "index redirects non-admin users" do
    sign_in @volunteer

    get admin_reports_path

    assert_redirected_to root_path
  end

  # -- Index --

  test "index renders the reports page for admin" do
    create(:service_hour, :approved, user: @volunteer, category: @category, hours: 3.0)
    sign_in @admin

    get admin_reports_path

    assert_response :success
  end

  test "index accepts date range params for filtering" do
    create(:service_hour, :approved, user: @volunteer, category: @category,
           service_date: 2.weeks.ago.to_date, hours: 5.0)
    sign_in @admin

    get admin_reports_path(start_date: 1.month.ago.to_date, end_date: Date.current)

    assert_response :success
  end

  # -- Export CSV --

  test "export_csv redirects unauthenticated users to sign in" do
    get export_csv_admin_reports_path

    assert_redirected_to new_user_session_path
  end

  test "export_csv redirects non-admin users" do
    sign_in @volunteer

    get export_csv_admin_reports_path

    assert_redirected_to root_path
  end

  test "export_csv returns CSV content type for admin" do
    create(:service_hour, :approved, user: @volunteer, category: @category, hours: 2.5)
    sign_in @admin

    get export_csv_admin_reports_path

    assert_response :success
    assert_equal "text/csv", response.content_type
  end

  test "export_csv includes the expected CSV headers" do
    create(:service_hour, :approved, user: @volunteer, category: @category, hours: 4.0)
    sign_in @admin

    get export_csv_admin_reports_path

    # Verify the CSV header row contains all expected columns
    csv_lines = response.body.lines
    headers = csv_lines.first.strip
    assert_includes headers, "Volunteer"
    assert_includes headers, "Email"
    assert_includes headers, "Hours"
    assert_includes headers, "Title"
    assert_includes headers, "On Campus"
    assert_includes headers, "Organization"
    assert_includes headers, "Contact Name"
    assert_includes headers, "Contact Email"
    assert_includes headers, "Opportunity"
  end

  test "export_csv includes new column data in rows" do
    create(:service_hour, :approved, user: @volunteer, category: @category,
           on_campus: true, organization_name: "Food Bank")
    sign_in @admin

    get export_csv_admin_reports_path

    csv = CSV.parse(response.body, headers: true)
    row = csv.first
    assert_equal "Yes", row["On Campus"]
    assert_equal "Food Bank", row["Organization"]
  end

  test "export_csv filters by date range" do
    create(:service_hour, :approved, user: @volunteer, category: @category,
           service_date: Date.new(2026, 1, 15))
    create(:service_hour, :approved, user: @volunteer, category: @category,
           service_date: Date.new(2026, 6, 15))
    sign_in @admin

    get export_csv_admin_reports_path(start_date: "2026-01-01", end_date: "2026-02-28")

    assert_response :success
    # Should include only the January record (header + 1 data row)
    lines = response.body.lines
    assert_equal 2, lines.size
  end
end
