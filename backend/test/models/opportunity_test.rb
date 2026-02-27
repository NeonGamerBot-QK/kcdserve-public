# frozen_string_literal: true

require "test_helper"

class OpportunityTest < ActiveSupport::TestCase
  # -- Validations --

  test "is valid with valid attributes" do
    opportunity = build(:opportunity)
    assert opportunity.valid?
  end

  test "is invalid without a title" do
    opportunity = build(:opportunity, title: nil)
    assert_not opportunity.valid?
    assert_includes opportunity.errors[:title], "can't be blank"
  end

  test "is invalid without a date" do
    opportunity = build(:opportunity, date: nil)
    assert_not opportunity.valid?
    assert_includes opportunity.errors[:date], "can't be blank"
  end

  # -- Associations --

  test "optionally belongs to a category" do
    opportunity = build(:opportunity, category: nil)
    assert opportunity.valid?
  end

  test "optionally belongs to a creator" do
    opportunity = build(:opportunity, creator: nil)
    assert opportunity.valid?
  end

  test "can be associated with a creator" do
    creator = create(:user, :admin)
    opportunity = create(:opportunity, creator: creator)
    assert_equal creator, opportunity.creator
  end

  test "has many opportunity_signups" do
    opportunity = create(:opportunity)
    signup = create(:opportunity_signup, opportunity: opportunity)
    assert_includes opportunity.opportunity_signups, signup
  end

  test "has many volunteers through opportunity_signups" do
    opportunity = create(:opportunity)
    volunteer = create(:user)
    create(:opportunity_signup, user: volunteer, opportunity: opportunity)

    assert_includes opportunity.volunteers, volunteer
  end

  test "has many service_hours" do
    opportunity = create(:opportunity)
    category = create(:category)
    service_hour = create(:service_hour, opportunity: opportunity, category: category)
    assert_includes opportunity.service_hours, service_hour
  end

  test "destroying opportunity destroys associated signups" do
    opportunity = create(:opportunity)
    create(:opportunity_signup, opportunity: opportunity)

    assert_difference "OpportunitySignup.count", -1 do
      opportunity.destroy
    end
  end

  test "destroying opportunity nullifies associated service_hours" do
    opportunity = create(:opportunity)
    category = create(:category)
    service_hour = create(:service_hour, opportunity: opportunity, category: category)

    opportunity.destroy
    service_hour.reload
    assert_nil service_hour.opportunity_id
  end

  test "has_many_attached photos" do
    opportunity = create(:opportunity)
    assert_respond_to opportunity, :photos
    assert_empty opportunity.photos
  end

  # -- Scopes --

  test ".published returns only published opportunities" do
    published = create(:opportunity, :published)
    _unpublished = create(:opportunity, published: false)

    results = Opportunity.published
    assert_includes results, published
    assert_not_includes results, _unpublished
  end

  test ".upcoming returns opportunities with date >= today ordered by date asc" do
    upcoming = create(:opportunity, date: 5.days.from_now)
    _past = create(:opportunity, :past)

    results = Opportunity.upcoming
    assert_includes results, upcoming
    assert_not_includes results, _past
  end

  test ".upcoming orders by date ascending" do
    later = create(:opportunity, date: 10.days.from_now)
    sooner = create(:opportunity, date: 2.days.from_now)

    results = Opportunity.upcoming
    assert_equal sooner, results.first
    assert_equal later, results.second
  end

  test ".past returns opportunities with date < today ordered by date desc" do
    _upcoming = create(:opportunity, date: 5.days.from_now)
    past_opp = create(:opportunity, date: 5.days.ago)

    results = Opportunity.past
    assert_includes results, past_opp
    assert_not_includes results, _upcoming
  end

  # -- Instance methods --

  test "#full? returns false when max_volunteers is nil" do
    opportunity = build(:opportunity, max_volunteers: nil)
    assert_not opportunity.full?
  end

  test "#full? returns false when volunteer count is below max" do
    opportunity = create(:opportunity, max_volunteers: 5)
    create(:opportunity_signup, opportunity: opportunity)

    assert_not opportunity.full?
  end

  test "#full? returns true when volunteer count equals max" do
    opportunity = create(:opportunity, max_volunteers: 2)
    2.times { create(:opportunity_signup, opportunity: opportunity) }

    assert opportunity.full?
  end

  test "#full? returns true when volunteer count exceeds max" do
    opportunity = create(:opportunity, max_volunteers: 1)
    2.times { create(:opportunity_signup, opportunity: opportunity) }

    assert opportunity.full?
  end

  test "#spots_remaining returns nil when max_volunteers is nil" do
    opportunity = build(:opportunity, max_volunteers: nil)
    assert_nil opportunity.spots_remaining
  end

  test "#spots_remaining returns correct remaining count" do
    opportunity = create(:opportunity, max_volunteers: 5)
    2.times { create(:opportunity_signup, opportunity: opportunity) }

    assert_equal 3, opportunity.spots_remaining
  end

  test "#spots_remaining returns 0 instead of negative when overfilled" do
    opportunity = create(:opportunity, max_volunteers: 1)
    2.times { create(:opportunity_signup, opportunity: opportunity) }

    assert_equal 0, opportunity.spots_remaining
  end
end
