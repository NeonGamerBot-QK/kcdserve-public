# frozen_string_literal: true

require "test_helper"

# Tests for on-demand PDF service resume generation and download
class ResumesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = create(:user)
  end

  # -- Authentication --

  test "show redirects unauthenticated users to sign in" do
    get resume_path(@user)

    assert_redirected_to new_user_session_path
  end

  # -- PDF generation --

  test "show generates a PDF with the correct content type for the current user" do
    sign_in @user

    get resume_path(@user)

    assert_response :success
    assert_equal "application/pdf", response.content_type
  end

  test "show is denied when a volunteer tries to download another user's resume" do
    other_user = create(:user)
    sign_in @user

    # UserPolicy#show? only allows self or admin
    assert_raises(Pundit::NotAuthorizedError) do
      get resume_path(other_user)
    end
  end

  test "show allows admin to download any user's resume" do
    admin = create(:user, :admin)
    sign_in admin

    get resume_path(@user)

    assert_response :success
    assert_equal "application/pdf", response.content_type
  end
end
