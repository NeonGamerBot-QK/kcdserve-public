# frozen_string_literal: true

require "test_helper"

# Tests for admin user management (list, view, create, edit, update, soft delete, restore, archived)
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

  test "index lists all active users for admin" do
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

  test "show renders a soft-deleted user detail page for admin" do
    sign_in @admin
    @volunteer.soft_delete!

    get admin_user_path(@volunteer)

    assert_response :success
  end

  # -- New / Create --

  test "new renders the user creation form for admin" do
    sign_in @admin

    get new_admin_user_path

    assert_response :success
  end

  test "create adds a new user for admin" do
    sign_in @admin

    assert_difference "User.count", 1 do
      post admin_users_path, params: {
        user: { first_name: "New", last_name: "Person", email: "newperson@example.com", role: "volunteer" }
      }
    end

    assert_redirected_to admin_user_path(User.last)
  end

  test "create re-renders new when params are invalid" do
    sign_in @admin

    assert_no_difference "User.count" do
      post admin_users_path, params: {
        user: { first_name: "", last_name: "", email: "" }
      }
    end

    assert_response :unprocessable_entity
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

  # -- Destroy (soft delete) --

  test "destroy soft-deletes a user instead of permanently removing them" do
    sign_in @admin

    assert_no_difference "User.with_deleted.count" do
      delete admin_user_path(@volunteer)
    end

    assert_redirected_to admin_users_path
    @volunteer.reload
    assert @volunteer.deleted?
  end

  test "destroy prevents admin from deleting their own account" do
    sign_in @admin

    delete admin_user_path(@admin)

    assert_redirected_to admin_users_path
    assert_equal "You cannot delete your own account.", flash[:alert]
    @admin.reload
    assert_not @admin.deleted?
  end

  # -- Restore --

  test "restore reactivates a soft-deleted user" do
    sign_in @admin
    @volunteer.soft_delete!

    patch restore_admin_user_path(@volunteer)

    assert_redirected_to admin_user_path(@volunteer)
    @volunteer.reload
    assert_not @volunteer.deleted?
  end

  # -- Archived --

  test "archived lists soft-deleted users" do
    sign_in @admin
    @volunteer.soft_delete!

    get archived_admin_users_path

    assert_response :success
  end

  test "archived filters users deleted 7+ years ago" do
    sign_in @admin
    # Manually set deleted_at to 8 years ago to simulate an old deletion
    @volunteer.update_columns(deleted_at: 8.years.ago)

    get archived_admin_users_path(filter: "7_years")

    assert_response :success
  end
end
