# frozen_string_literal: true

require "test_helper"

# Tests for the admin dashboard analytics overview
class Admin::DashboardControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = create(:user, :admin)
    @volunteer = create(:user)
  end

  # -- Authentication & Authorization --

  test "index redirects unauthenticated users to sign in" do
    get admin_root_path

    assert_redirected_to new_user_session_path
  end

  test "index redirects non-admin users away from the admin area" do
    sign_in @volunteer

    get admin_root_path

    assert_redirected_to root_path
    assert_equal "You are not authorized to access the admin area.", flash[:alert]
  end

  # -- Rendering --

  test "index renders the dashboard for an admin user" do
    category = create(:category)
    create(:service_hour, :approved, user: @volunteer, category: category, hours: 5.0)
    create(:service_hour, user: @volunteer, category: category) # pending
    sign_in @admin

    get admin_root_path

    assert_response :success
  end
end
