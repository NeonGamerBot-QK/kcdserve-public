# frozen_string_literal: true

require "test_helper"

# Tests for on-demand PDF service resume generation, CSV export, and access control
class ResumesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = create(:user)
    @category = create(:category)
    # Create a service hour with the new title field to verify it appears in exports
    @service_hour = create(:service_hour, :approved, user: @user, category: @category, title: "Park Cleanup")
  end

  # -- Authentication --

  test "show redirects unauthenticated users to sign in" do
    get resume_path(@user)

    assert_redirected_to new_user_session_path
  end

  test "export_csv redirects unauthenticated users to sign in" do
    get resume_csv_path(@user)

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

  # -- CSV export --

  test "export_csv generates a CSV with correct content type" do
    sign_in @user

    get resume_csv_path(@user)

    assert_response :success
    assert_equal "text/csv", response.content_type
  end

  test "export_csv includes header row and service hour data" do
    sign_in @user

    get resume_csv_path(@user)

    csv = CSV.parse(response.body, headers: true)
    assert_equal %w[Date Title Category Opportunity Group Hours Description], csv.headers
    assert_equal 1, csv.size
    assert_equal "Park Cleanup", csv.first["Title"]
  end

  test "export_csv is denied when a volunteer tries to export another user's hours" do
    other_user = create(:user)
    sign_in @user

    assert_raises(Pundit::NotAuthorizedError) do
      get resume_csv_path(other_user)
    end
  end

  test "export_csv allows admin to export any user's hours" do
    admin = create(:user, :admin)
    sign_in admin

    get resume_csv_path(@user)

    assert_response :success
    assert_equal "text/csv", response.content_type
  end
end
