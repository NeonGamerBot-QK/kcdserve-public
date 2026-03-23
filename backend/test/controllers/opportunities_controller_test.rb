# frozen_string_literal: true

require "test_helper"

# Tests for volunteer opportunity listing, detail view, admin CRUD, and signup/withdraw
class OpportunitiesControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = create(:user, :admin)
    @volunteer = create(:user)
    @category = create(:category)
  end

  # -- Public access --

  test "index renders successfully without authentication" do
    create(:opportunity, published: true, date: 1.week.from_now)

    get opportunities_path

    assert_response :success
  end

  test "show renders a published opportunity without authentication" do
    opportunity = create(:opportunity, published: true, date: 1.week.from_now)

    get opportunity_path(opportunity)

    assert_response :success
  end

  test "show denies access to unpublished opportunity for unauthenticated user" do
    opportunity = create(:opportunity, published: false, date: 1.week.from_now)

    get opportunity_path(opportunity)

    assert_response :redirect
    assert_equal "You are not authorized to perform this action.", flash[:alert]
  end

  # -- Admin CRUD --

  test "create requires admin authorization" do
    sign_in @volunteer

    post opportunities_path, params: {
      opportunity: { title: "New Event", date: 1.week.from_now, description: "Fun" }
    }

    assert_response :redirect
    assert_equal "You are not authorized to perform this action.", flash[:alert]
  end

  test "create succeeds for admin and sets creator" do
    sign_in @admin

    assert_difference "Opportunity.count", 1 do
      post opportunities_path, params: {
        opportunity: {
          title: "Admin Event",
          date: 1.week.from_now,
          description: "Admin-created",
          published: true,
          category_id: @category.id
        }
      }
    end

    created = Opportunity.last
    assert_equal @admin.id, created.created_by_id
    assert_redirected_to opportunity_path(created)
  end

  test "update requires admin authorization" do
    opportunity = create(:opportunity, published: true, date: 1.week.from_now)
    sign_in @volunteer

    patch opportunity_path(opportunity), params: {
      opportunity: { title: "Hacked Title" }
    }

    assert_response :redirect
    assert_equal "You are not authorized to perform this action.", flash[:alert]
  end

  test "update succeeds for admin" do
    opportunity = create(:opportunity, published: true, date: 1.week.from_now)
    sign_in @admin

    patch opportunity_path(opportunity), params: {
      opportunity: { title: "Updated Title" }
    }

    assert_redirected_to opportunity_path(opportunity)
    assert_equal "Updated Title", opportunity.reload.title
  end

  test "destroy requires admin authorization" do
    opportunity = create(:opportunity, date: 1.week.from_now)
    sign_in @volunteer

    delete opportunity_path(opportunity)

    assert_response :redirect
    assert_equal "You are not authorized to perform this action.", flash[:alert]
  end

  test "destroy succeeds for admin" do
    opportunity = create(:opportunity, date: 1.week.from_now)
    sign_in @admin

    assert_difference "Opportunity.count", -1 do
      delete opportunity_path(opportunity)
    end

    assert_redirected_to opportunities_path
  end

  # -- Signup / Withdraw --

  test "signup creates an OpportunitySignup for the current user" do
    opportunity = create(:opportunity, published: true, date: 1.week.from_now)
    sign_in @volunteer

    assert_difference "OpportunitySignup.count", 1 do
      post signup_opportunity_path(opportunity)
    end

    assert OpportunitySignup.exists?(user: @volunteer, opportunity: opportunity)
    assert_redirected_to opportunity_path(opportunity)
  end

  test "signup is idempotent and does not create duplicate signups" do
    opportunity = create(:opportunity, published: true, date: 1.week.from_now)
    create(:opportunity_signup, user: @volunteer, opportunity: opportunity)
    sign_in @volunteer

    assert_no_difference "OpportunitySignup.count" do
      post signup_opportunity_path(opportunity)
    end
  end

  test "withdraw removes the OpportunitySignup for the current user" do
    opportunity = create(:opportunity, published: true, date: 1.week.from_now)
    create(:opportunity_signup, user: @volunteer, opportunity: opportunity)
    sign_in @volunteer

    assert_difference "OpportunitySignup.count", -1 do
      delete withdraw_opportunity_path(opportunity)
    end

    assert_not OpportunitySignup.exists?(user: @volunteer, opportunity: opportunity)
    assert_redirected_to opportunity_path(opportunity)
  end
end
