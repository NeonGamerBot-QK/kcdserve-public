# frozen_string_literal: true

require "test_helper"

class GroupMembershipTest < ActiveSupport::TestCase
  # -- Validations --

  test "is valid with valid attributes" do
    membership = build(:group_membership)
    assert membership.valid?
  end

  test "is invalid when user is already a member of the same group" do
    user = create(:user)
    group = create(:group)
    create(:group_membership, user: user, group: group)

    duplicate = build(:group_membership, user: user, group: group)
    assert_not duplicate.valid?
    assert_includes duplicate.errors[:user_id], "is already a member of this group"
  end

  test "allows the same user to join different groups" do
    user = create(:user)
    create(:group_membership, user: user, group: create(:group))

    different_membership = build(:group_membership, user: user, group: create(:group))
    assert different_membership.valid?
  end

  test "allows different users to join the same group" do
    group = create(:group)
    create(:group_membership, user: create(:user), group: group)

    another_membership = build(:group_membership, user: create(:user), group: group)
    assert another_membership.valid?
  end

  # -- Associations --

  test "belongs to a user" do
    membership = create(:group_membership)
    assert_instance_of User, membership.user
  end

  test "belongs to a group" do
    membership = create(:group_membership)
    assert_instance_of Group, membership.group
  end
end
