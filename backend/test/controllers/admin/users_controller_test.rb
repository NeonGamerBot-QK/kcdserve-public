# frozen_string_literal: true

require "test_helper"

# Tests for admin user management (list, view, edit, update, delete)
class Admin::UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = create(:user, :admin)
    @volunteer = create(:user)
  end

  # -- Authentication & Authorization --

  test "index redirects unauthenticated users to sign in" do
    get admin_users_path

    assert_redirected_to new_user_session_path
  end

  test "index redirects non-admin users" do
    sign_in @volunteer

    get admin_users_path

    assert_redirected_to root_path
  end

  # -- Index --

  test "index lists all users for admin" do
    sign_in @admin

    get admin_users_path

    assert_response :success
  end

  # -- Show --

  test "show renders a user detail page for admin" do
    sign_in @admin

    get admin_user_path(@volunteer)

    assert_response :success
  end

  # -- Edit --

  test "edit renders the user edit form for admin" do
    sign_in @admin

    get edit_admin_user_path(@volunteer)

    assert_response :success
  end

  # -- Update --

  test "update changes user attributes for admin" do
    sign_in @admin

    patch admin_user_path(@volunteer), params: {
      user: { first_name: "Changed", role: "group_leader" }
    }

    assert_redirected_to admin_user_path(@volunteer)
    @volunteer.reload
    assert_equal "Changed", @volunteer.first_name
    assert_equal "group_leader", @volunteer.role
  end

  test "update re-renders edit when params are invalid" do
    sign_in @admin

    patch admin_user_path(@volunteer), params: {
      user: { first_name: "" }
    }

    assert_response :unprocessable_entity
  end

  # -- Destroy --

  test "destroy removes a user for admin" do
    sign_in @admin

    assert_difference "User.count", -1 do
      delete admin_user_path(@volunteer)
    end

    assert_redirected_to admin_users_path
  end

  test "destroy prevents admin from deleting their own account" do
    sign_in @admin

    assert_no_difference "User.count" do
      delete admin_user_path(@admin)
    end

    assert_redirected_to admin_users_path
    assert_equal "You cannot delete your own account.", flash[:alert]
  end
end
