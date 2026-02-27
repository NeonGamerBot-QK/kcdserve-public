# frozen_string_literal: true

require "test_helper"

class GroupTest < ActiveSupport::TestCase
  # -- Validations --

  test "is valid with valid attributes" do
    group = build(:group)
    assert group.valid?
  end

  test "is invalid without a name" do
    group = build(:group, name: nil)
    assert_not group.valid?
    assert_includes group.errors[:name], "can't be blank"
  end

  test "is invalid with a duplicate name" do
    create(:group, name: "Unique Group")
    duplicate = build(:group, name: "Unique Group")

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:name], "has already been taken"
  end

  # -- Associations --

  test "optionally belongs to a leader" do
    group = build(:group, leader: nil)
    assert group.valid?
  end

  test "can be associated with a leader" do
    leader = create(:user, :group_leader)
    group = create(:group, leader: leader)
    assert_equal leader, group.leader
  end

  test "has many group_memberships" do
    group = create(:group)
    membership = create(:group_membership, group: group)
    assert_includes group.group_memberships, membership
  end

  test "has many members through group_memberships" do
    group = create(:group)
    member = create(:user)
    create(:group_membership, user: member, group: group)

    assert_includes group.members, member
  end

  test "has many service_hours" do
    group = create(:group)
    category = create(:category)
    service_hour = create(:service_hour, group: group, category: category)
    assert_includes group.service_hours, service_hour
  end

  test "destroying group destroys associated memberships" do
    group = create(:group)
    create(:group_membership, group: group)

    assert_difference "GroupMembership.count", -1 do
      group.destroy
    end
  end

  test "destroying group nullifies associated service_hours" do
    group = create(:group)
    category = create(:category)
    service_hour = create(:service_hour, group: group, category: category)

    group.destroy
    service_hour.reload
    assert_nil service_hour.group_id
  end

  test "has_one_attached logo" do
    group = create(:group)
    assert_respond_to group, :logo
    assert_not group.logo.attached?
  end

  # -- Instance methods --

  test "#total_approved_hours sums only approved service hours for the group" do
    group = create(:group)
    category = create(:category)
    create(:service_hour, :approved, group: group, category: category, hours: 4.0)
    create(:service_hour, :approved, group: group, category: category, hours: 2.5)
    create(:service_hour, group: group, category: category, hours: 3.0) # pending, should be excluded
    create(:service_hour, :rejected, group: group, category: category, hours: 1.0) # rejected, should be excluded

    assert_equal 6.5, group.total_approved_hours
  end

  test "#total_approved_hours returns 0 when no approved hours exist" do
    group = create(:group)
    assert_equal 0, group.total_approved_hours
  end

  test "#member_count returns the number of members" do
    group = create(:group)
    3.times { create(:group_membership, group: group) }

    assert_equal 3, group.member_count
  end

  test "#member_count returns 0 when group has no members" do
    group = create(:group)
    assert_equal 0, group.member_count
  end
end
