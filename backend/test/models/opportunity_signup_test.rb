# frozen_string_literal: true

require "test_helper"

class OpportunitySignupTest < ActiveSupport::TestCase
  # -- Validations --

  test "is valid with valid attributes" do
    signup = build(:opportunity_signup)
    assert signup.valid?
  end

  test "is invalid when user has already signed up for the same opportunity" do
    user = create(:user)
    opportunity = create(:opportunity)
    create(:opportunity_signup, user: user, opportunity: opportunity)

    duplicate = build(:opportunity_signup, user: user, opportunity: opportunity)
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:user_id], "has already signed up for this opportunity"
  end

  test "allows the same user to sign up for different opportunities" do
    user = create(:user)
    create(:opportunity_signup, user: user, opportunity: create(:opportunity))

    different_signup = build(:opportunity_signup, user: user, opportunity: create(:opportunity))
    assert different_signup.valid?
  end

  test "allows different users to sign up for the same opportunity" do
    opportunity = create(:opportunity)
    create(:opportunity_signup, user: create(:user), opportunity: opportunity)

    another_signup = build(:opportunity_signup, user: create(:user), opportunity: opportunity)
    assert another_signup.valid?
  end

  # -- Associations --

  test "belongs to a user" do
    signup = create(:opportunity_signup)
    assert_instance_of User, signup.user
  end

  test "belongs to an opportunity" do
    signup = create(:opportunity_signup)
    assert_instance_of Opportunity, signup.opportunity
  end
end
