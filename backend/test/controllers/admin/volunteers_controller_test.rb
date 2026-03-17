# frozen_string_literal: true

require "test_helper"

# Tests for the admin volunteers listing page
class Admin::VolunteersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = create(:user, :admin)
    @volunteer = create(:user)
  end

  test "index redirects unauthenticated users to sign in" do
    get admin_volunteers_path

    assert_redirected_to new_user_session_path
  end

  test "index redirects non-admin users away from the admin area" do
    sign_in @volunteer

    get admin_volunteers_path

    assert_redirected_to root_path
    assert_equal "You are not authorized to access the admin area.", flash[:alert]
  end

  test "index renders the volunteers page for an admin user" do
    sign_in @admin

    get admin_volunteers_path

    assert_response :success
    assert_select "h1", "Volunteers"
  end
end
