# frozen_string_literal: true

require "test_helper"

# Tests for admin service hour listing, filtering, and review workflow
class Admin::ServiceHoursControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = create(:user, :admin)
    @volunteer = create(:user)
    @category = create(:category)
  end

  # -- Authentication & Authorization --

  test "index redirects unauthenticated users to sign in" do
    get admin_service_hours_path

    assert_redirected_to new_user_session_path
  end

  test "index redirects non-admin users" do
    sign_in @volunteer

    get admin_service_hours_path

    assert_redirected_to root_path
  end

  # -- Index --

  test "index lists all service hours for admin" do
    create(:service_hour, user: @volunteer, category: @category)
    sign_in @admin

    get admin_service_hours_path

    assert_response :success
  end

  test "index filters service hours by status when status param is provided" do
    pending_hour = create(:service_hour, user: @volunteer, category: @category, description: "Pending unique desc")
    approved_hour = create(:service_hour, :approved, user: @volunteer, category: @category, description: "Approved unique desc")
    sign_in @admin

    # Filter by pending status only
    get admin_service_hours_path(status: "pending")

    assert_response :success
    assert_match pending_hour.description, response.body
    assert_no_match approved_hour.description, response.body
  end

  # -- Show --

  test "show renders service hour detail for admin" do
    hour = create(:service_hour, user: @volunteer, category: @category)
    sign_in @admin

    get admin_service_hour_path(hour)

    assert_response :success
  end

  # -- Review --

  test "review approves a service hour and enqueues notification mailer" do
    hour = create(:service_hour, user: @volunteer, category: @category)
    sign_in @admin

    assert_enqueued_emails 1 do
      patch review_admin_service_hour_path(hour), params: {
        status: "approved",
        admin_comment: "Great work!"
      }
    end

    hour.reload
    assert_equal "approved", hour.status
    assert_equal @admin.id, hour.reviewed_by_id
    assert_equal "Great work!", hour.admin_comment
    assert_not_nil hour.reviewed_at
    assert_redirected_to admin_service_hours_path(status: :pending)
  end

  test "review rejects a service hour with admin comment" do
    hour = create(:service_hour, user: @volunteer, category: @category)
    sign_in @admin

    patch review_admin_service_hour_path(hour), params: {
      status: "rejected",
      admin_comment: "Missing details"
    }

    hour.reload
    assert_equal "rejected", hour.status
    assert_equal "Missing details", hour.admin_comment
  end
end
