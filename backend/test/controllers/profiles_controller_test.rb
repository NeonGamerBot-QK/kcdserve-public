# frozen_string_literal: true

require "test_helper"

# Tests for volunteer profile viewing and editing
class ProfilesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = create(:user)
  end

  # -- Authentication --

  test "show redirects unauthenticated users to sign in" do
    get profile_path(@user)

    assert_redirected_to new_user_session_path
  end

  # -- Show --

  test "show renders the current user's own profile" do
    category = create(:category)
    create(:service_hour, :approved, user: @user, category: category)
    sign_in @user

    get profile_path(@user)

    assert_response :success
  end

  test "show is denied when a volunteer tries to view another user's profile" do
    other_user = create(:user)
    sign_in @user

    # UserPolicy#show? only allows self or admin
    assert_raises(Pundit::NotAuthorizedError) do
      get profile_path(other_user)
    end
  end

  test "show allows admin to view any user's profile" do
    admin = create(:user, :admin)
    sign_in admin

    get profile_path(@user)

    assert_response :success
  end

  # -- Edit --

  test "edit redirects unauthenticated users to sign in" do
    get edit_profile_path(@user)

    assert_redirected_to new_user_session_path
  end

  test "edit renders for the profile owner" do
    sign_in @user

    get edit_profile_path(@user)

    assert_response :success
  end

  # -- Update --

  test "update changes the user's profile information" do
    sign_in @user

    patch profile_path(@user), params: {
      user: { first_name: "Updated", last_name: "Name", bio: "New bio" }
    }

    assert_redirected_to profile_path(@user)
    @user.reload
    assert_equal "Updated", @user.first_name
    assert_equal "New bio", @user.bio
  end

  test "update re-renders edit when params are invalid" do
    sign_in @user

    patch profile_path(@user), params: {
      user: { first_name: "" } # first_name is required
    }

    assert_response :unprocessable_entity
  end
end
