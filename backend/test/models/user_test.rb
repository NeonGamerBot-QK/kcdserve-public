# frozen_string_literal: true

require "test_helper"

class UserTest < ActiveSupport::TestCase
  # -- Validations --

  test "is valid with valid attributes" do
    user = build(:user)
    assert user.valid?
  end

  test "is invalid without a first_name" do
    user = build(:user, first_name: nil)
    assert_not user.valid?
    assert_includes user.errors[:first_name], "can't be blank"
  end

  test "is invalid without a last_name" do
    user = build(:user, last_name: nil)
    assert_not user.valid?
    assert_includes user.errors[:last_name], "can't be blank"
  end

  # -- Associations --

  test "has many service_hours" do
    user = create(:user)
    category = create(:category)
    create(:service_hour, user: user, category: category)
    create(:service_hour, user: user, category: category)

    assert_equal 2, user.service_hours.count
  end

  test "has many groups through group_memberships" do
    user = create(:user)
    group = create(:group)
    create(:group_membership, user: user, group: group)

    assert_includes user.groups, group
  end

  test "has many led_groups as leader" do
    leader = create(:user, :group_leader)
    group = create(:group, leader: leader)

    assert_includes leader.led_groups, group
  end

  test "has many reviewed_hours as reviewer" do
    reviewer = create(:user, :admin)
    category = create(:category)
    hour = create(:service_hour, :approved, category: category, reviewer: reviewer)

    assert_includes reviewer.reviewed_hours, hour
  end

  test "has many created_opportunities as creator" do
    creator = create(:user, :admin)
    opportunity = create(:opportunity, creator: creator)

    assert_includes creator.created_opportunities, opportunity
  end

  test "has many opportunity_signups" do
    user = create(:user)
    opportunity = create(:opportunity)
    signup = create(:opportunity_signup, user: user, opportunity: opportunity)

    assert_includes user.opportunity_signups, signup
  end

  test "has many signed_up_opportunities through opportunity_signups" do
    user = create(:user)
    opportunity = create(:opportunity)
    create(:opportunity_signup, user: user, opportunity: opportunity)

    assert_includes user.signed_up_opportunities, opportunity
  end

  test "has_one_attached avatar" do
    user = create(:user)
    assert_respond_to user, :avatar
    assert_not user.avatar.attached?
  end

  # -- Enum role --

  test "defaults to volunteer role" do
    user = create(:user)
    assert user.volunteer?
  end

  test "can be assigned group_leader role" do
    user = create(:user, :group_leader)
    assert user.group_leader?
  end

  test "can be assigned admin role" do
    user = create(:user, :admin)
    assert user.admin?
  end

  test "can be assigned super_admin role" do
    user = create(:user, :super_admin)
    assert user.super_admin?
  end

  # -- Instance methods --

  test "#full_name returns first and last name joined by a space" do
    user = build(:user, first_name: "Jane", last_name: "Doe")
    assert_equal "Jane Doe", user.full_name
  end

  test "#total_approved_hours sums only approved service hours" do
    user = create(:user)
    category = create(:category)
    create(:service_hour, :approved, user: user, category: category, hours: 3.5)
    create(:service_hour, :approved, user: user, category: category, hours: 2.0)
    create(:service_hour, user: user, category: category, hours: 5.0) # pending, should be excluded
    create(:service_hour, :rejected, user: user, category: category, hours: 1.0) # rejected, should be excluded

    assert_equal 5.5, user.total_approved_hours
  end

  test "#total_approved_hours returns 0 when no approved hours exist" do
    user = create(:user)
    category = create(:category)
    create(:service_hour, user: user, category: category, hours: 4.0) # pending

    assert_equal 0, user.total_approved_hours
  end

  test "#admin_or_above? returns true for admin" do
    assert create(:user, :admin).admin_or_above?
  end

  test "#admin_or_above? returns true for super_admin" do
    assert create(:user, :super_admin).admin_or_above?
  end

  test "#admin_or_above? returns false for volunteer" do
    assert_not create(:user).admin_or_above?
  end

  test "#admin_or_above? returns false for group_leader" do
    assert_not create(:user, :group_leader).admin_or_above?
  end

  # -- Soft deletion --

  test "#soft_delete! sets deleted_at timestamp" do
    user = create(:user)
    user.soft_delete!

    assert user.deleted?
    assert_not_nil user.deleted_at
  end

  test "#restore! clears deleted_at timestamp" do
    user = create(:user)
    user.soft_delete!
    user.restore!

    assert_not user.deleted?
    assert_nil user.deleted_at
  end

  test "soft-deleting a user preserves their service hours" do
    user = create(:user)
    category = create(:category)
    hour = create(:service_hour, user: user, category: category)
    user.soft_delete!

    assert ServiceHour.exists?(hour.id), "Service hours should not be destroyed on soft-delete"
    assert_equal user.id, hour.reload.user_id
  end

  test "default scope excludes soft-deleted users" do
    user = create(:user)
    user.soft_delete!

    assert_not_includes User.all, user
  end

  test ".with_deleted includes soft-deleted users" do
    user = create(:user)
    user.soft_delete!

    assert_includes User.with_deleted, user
  end

  test ".only_deleted returns only soft-deleted users" do
    active_user = create(:user)
    deleted_user = create(:user)
    deleted_user.soft_delete!

    results = User.only_deleted
    assert_includes results, deleted_user
    assert_not_includes results, active_user
  end

  test ".deleted_over_7_years_ago returns users deleted more than 7 years ago" do
    recent_delete = create(:user)
    recent_delete.soft_delete!

    old_delete = create(:user)
    old_delete.update_columns(deleted_at: 8.years.ago)

    results = User.deleted_over_7_years_ago
    assert_includes results, old_delete
    assert_not_includes results, recent_delete
  end

  # -- Class methods --

  test ".from_omniauth creates a new user from an auth hash" do
    auth = OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: "123456",
      info: {
        email: "newuser@example.com",
        first_name: "New",
        last_name: "User",
        name: "New User"
      }
    )

    assert_difference "User.count", 1 do
      user = User.from_omniauth(auth)
      assert_equal "newuser@example.com", user.email
      assert_equal "New", user.first_name
      assert_equal "User", user.last_name
      assert_equal "google_oauth2", user.provider
      assert_equal "123456", user.uid
    end
  end

  test ".from_omniauth finds an existing user by provider and uid" do
    existing_user = create(:user, provider: "google_oauth2", uid: "123456")

    auth = OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: "123456",
      info: {
        email: "other@example.com",
        first_name: "Other",
        last_name: "Name",
        name: "Other Name"
      }
    )

    assert_no_difference "User.count" do
      found_user = User.from_omniauth(auth)
      assert_equal existing_user.id, found_user.id
    end
  end

  test ".from_omniauth falls back to parsed name when first/last name missing" do
    auth = OmniAuth::AuthHash.new(
      provider: "google_oauth2",
      uid: "789",
      info: {
        email: "fallback@example.com",
        name: "Fallback Person"
      }
    )

    user = User.from_omniauth(auth)
    assert_equal "Fallback", user.first_name
    assert_equal "Person", user.last_name
  end
end
