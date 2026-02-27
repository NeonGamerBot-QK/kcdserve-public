# frozen_string_literal: true

require "test_helper"

# Tests for service hour submission, editing, deletion, and admin review workflow
class ServiceHoursControllerTest < ActionDispatch::IntegrationTest
  setup do
    @category = create(:category)
    @volunteer = create(:user)
    @admin = create(:user, :admin)
  end

  # -- Authentication --

  test "index redirects unauthenticated users to sign in" do
    get service_hours_path

    assert_redirected_to new_user_session_path
  end

  # -- Index --

  test "index shows only the volunteer's own hours for a regular user" do
    own_hour = create(:service_hour, user: @volunteer, category: @category)
    other_hour = create(:service_hour, category: @category) # belongs to another user
    sign_in @volunteer

    get service_hours_path

    assert_response :success
    # Volunteer should see their own hours but not another user's
    assert_match own_hour.description, response.body
    assert_no_match other_hour.description, response.body
  end

  test "index shows all hours for an admin user" do
    hour_a = create(:service_hour, user: @volunteer, category: @category, description: "Hour A unique")
    hour_b = create(:service_hour, category: @category, description: "Hour B unique")
    sign_in @admin

    get service_hours_path

    assert_response :success
    assert_match hour_a.description, response.body
    assert_match hour_b.description, response.body
  end

  # -- Show --

  test "show displays the service hour for the owning volunteer" do
    hour = create(:service_hour, user: @volunteer, category: @category)
    sign_in @volunteer

    get service_hour_path(hour)

    assert_response :success
  end

  test "show allows admin to view any service hour" do
    hour = create(:service_hour, user: @volunteer, category: @category)
    sign_in @admin

    get service_hour_path(hour)

    assert_response :success
  end

  test "show denies access when volunteer tries to view another user's hour" do
    other_user_hour = create(:service_hour, category: @category)
    sign_in @volunteer

    assert_raises(Pundit::NotAuthorizedError) do
      get service_hour_path(other_user_hour)
    end
  end

  # -- Create --

  test "create builds a service hour for the current user and enqueues mailer" do
    sign_in @volunteer

    assert_enqueued_emails 1 do
      assert_difference "ServiceHour.count", 1 do
        post service_hours_path, params: {
          service_hour: {
            hours: 4.0,
            description: "Helped at the shelter",
            service_date: Date.current,
            category_id: @category.id
          }
        }
      end
    end

    created_hour = ServiceHour.last
    assert_equal @volunteer.id, created_hour.user_id
    assert_equal "pending", created_hour.status
    assert_redirected_to service_hour_path(created_hour)
  end

  test "create renders new with errors when params are invalid" do
    sign_in @volunteer

    assert_no_difference "ServiceHour.count" do
      post service_hours_path, params: {
        service_hour: { hours: nil, description: "", service_date: nil, category_id: @category.id }
      }
    end

    assert_response :unprocessable_entity
  end

  # -- Update --

  test "update succeeds on own pending service hour" do
    hour = create(:service_hour, user: @volunteer, category: @category)
    sign_in @volunteer

    patch service_hour_path(hour), params: {
      service_hour: { description: "Updated description" }
    }

    assert_redirected_to service_hour_path(hour)
    assert_equal "Updated description", hour.reload.description
  end

  test "update is denied on an already-approved service hour" do
    hour = create(:service_hour, :approved, user: @volunteer, category: @category)
    sign_in @volunteer

    # Pundit policy denies update on non-pending hours
    assert_raises(Pundit::NotAuthorizedError) do
      patch service_hour_path(hour), params: {
        service_hour: { description: "Trying to change approved" }
      }
    end
  end

  # -- Destroy --

  test "destroy removes own pending service hour" do
    hour = create(:service_hour, user: @volunteer, category: @category)
    sign_in @volunteer

    assert_difference "ServiceHour.count", -1 do
      delete service_hour_path(hour)
    end

    assert_redirected_to service_hours_path
  end

  test "destroy is denied on an already-approved service hour" do
    hour = create(:service_hour, :approved, user: @volunteer, category: @category)
    sign_in @volunteer

    assert_raises(Pundit::NotAuthorizedError) do
      delete service_hour_path(hour)
    end
  end

  # -- Review (admin-only) --

  test "review updates status and reviewer when performed by admin" do
    hour = create(:service_hour, user: @volunteer, category: @category)
    sign_in @admin

    assert_enqueued_emails 1 do
      patch review_service_hour_path(hour), params: {
        status: "approved",
        admin_comment: "Looks good!"
      }
    end

    hour.reload
    assert_equal "approved", hour.status
    assert_equal @admin.id, hour.reviewed_by_id
    assert_equal "Looks good!", hour.admin_comment
    assert_not_nil hour.reviewed_at
    assert_redirected_to service_hour_path(hour)
  end

  test "review is denied for a regular volunteer" do
    hour = create(:service_hour, user: @volunteer, category: @category)
    sign_in @volunteer

    assert_raises(Pundit::NotAuthorizedError) do
      patch review_service_hour_path(hour), params: { status: "approved" }
    end
  end
end
