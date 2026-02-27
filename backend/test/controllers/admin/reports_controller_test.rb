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

    # Verify the CSV header row is present
    csv_lines = response.body.lines
    assert_includes csv_lines.first, "Volunteer"
    assert_includes csv_lines.first, "Email"
    assert_includes csv_lines.first, "Hours"
  end
end
