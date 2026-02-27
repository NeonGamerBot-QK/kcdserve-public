# frozen_string_literal: true

require "test_helper"

# Tests for admin service category CRUD
class Admin::CategoriesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = create(:user, :admin)
    @volunteer = create(:user)
    @category = create(:category)
  end

  # -- Authentication & Authorization --

  test "index redirects unauthenticated users to sign in" do
    get admin_categories_path

    assert_redirected_to new_user_session_path
  end

  test "index redirects non-admin users" do
    sign_in @volunteer

    get admin_categories_path

    assert_redirected_to root_path
  end

  # -- Index --

  test "index lists all categories for admin" do
    sign_in @admin

    get admin_categories_path

    assert_response :success
  end

  # -- New --

  test "new renders the category form for admin" do
    sign_in @admin

    get new_admin_category_path

    assert_response :success
  end

  # -- Create --

  test "create adds a new category for admin" do
    sign_in @admin

    assert_difference "Category.count", 1 do
      post admin_categories_path, params: {
        category: { name: "Environmental", description: "Green projects", color: "#28a745" }
      }
    end

    assert_redirected_to admin_categories_path
  end

  test "create re-renders new when params are invalid" do
    sign_in @admin

    assert_no_difference "Category.count" do
      post admin_categories_path, params: {
        category: { name: "" } # name is required
      }
    end

    assert_response :unprocessable_entity
  end

  # -- Edit --

  test "edit renders the category edit form for admin" do
    sign_in @admin

    get edit_admin_category_path(@category)

    assert_response :success
  end

  # -- Update --

  test "update changes category attributes for admin" do
    sign_in @admin

    patch admin_category_path(@category), params: {
      category: { name: "Renamed Category" }
    }

    assert_redirected_to admin_categories_path
    assert_equal "Renamed Category", @category.reload.name
  end

  test "update re-renders edit when params are invalid" do
    # Create another category first so uniqueness validation can trigger
    create(:category, name: "Existing Name")
    sign_in @admin

    patch admin_category_path(@category), params: {
      category: { name: "Existing Name" } # duplicate name
    }

    assert_response :unprocessable_entity
  end

  # -- Destroy --

  test "destroy removes a category for admin" do
    sign_in @admin

    assert_difference "Category.count", -1 do
      delete admin_category_path(@category)
    end

    assert_redirected_to admin_categories_path
  end
end
