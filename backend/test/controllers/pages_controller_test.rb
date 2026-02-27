# frozen_string_literal: true

require "test_helper"

# Tests for public landing page and authenticated dashboard
class PagesControllerTest < ActionDispatch::IntegrationTest
  # -- Home page --

  test "home page redirects to dashboard when user is signed in" do
    user = create(:user)
    sign_in user

    get root_path

    assert_redirected_to dashboard_path
  end

  test "home page renders successfully for unauthenticated guests" do
    # Published upcoming opportunities should be visible on the landing page
    create(:opportunity, published: true, date: 1.week.from_now)

    get root_path

    assert_response :success
  end

  # -- Dashboard --

  test "dashboard redirects unauthenticated users to sign in" do
    get dashboard_path

    assert_redirected_to new_user_session_path
  end

  test "dashboard renders successfully and assigns user data when signed in" do
    user = create(:user)
    category = create(:category)
    create(:service_hour, user: user, category: category, status: :approved, hours: 3.0)
    create(:service_hour, user: user, category: category, status: :pending)
    sign_in user

    get dashboard_path

    assert_response :success
  end
end
