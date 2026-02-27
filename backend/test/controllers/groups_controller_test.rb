# frozen_string_literal: true

require "test_helper"

# Tests for group CRUD, join/leave, and admin/leader member management
class GroupsControllerTest < ActionDispatch::IntegrationTest
  setup do
    @admin = create(:user, :admin)
    @volunteer = create(:user)
    @leader = create(:user, :group_leader)
    @group = create(:group, leader: @leader)
  end

  # -- Public access --

  test "index renders successfully without authentication" do
    get groups_path

    assert_response :success
  end

  test "show renders a group page without authentication" do
    get group_path(@group)

    assert_response :success
  end

  # -- Admin CRUD --

  test "create requires admin authorization" do
    sign_in @volunteer

    assert_raises(Pundit::NotAuthorizedError) do
      post groups_path, params: { group: { name: "Sneaky Group" } }
    end
  end

  test "create succeeds for admin" do
    sign_in @admin

    assert_difference "Group.count", 1 do
      post groups_path, params: {
        group: { name: "New Service Club", description: "A brand new club" }
      }
    end

    assert_redirected_to group_path(Group.last)
  end

  test "update requires admin or leader authorization" do
    sign_in @volunteer

    assert_raises(Pundit::NotAuthorizedError) do
      patch group_path(@group), params: { group: { name: "Hacked" } }
    end
  end

  test "update succeeds for the group leader" do
    sign_in @leader

    patch group_path(@group), params: { group: { description: "Updated by leader" } }

    assert_redirected_to group_path(@group)
    assert_equal "Updated by leader", @group.reload.description
  end

  test "destroy requires admin authorization" do
    sign_in @leader # leader cannot destroy, only admin

    assert_raises(Pundit::NotAuthorizedError) do
      delete group_path(@group)
    end
  end

  test "destroy succeeds for admin" do
    sign_in @admin

    assert_difference "Group.count", -1 do
      delete group_path(@group)
    end

    assert_redirected_to groups_path
  end

  # -- Join / Leave --

  test "join creates a GroupMembership for the current user" do
    sign_in @volunteer

    assert_difference "GroupMembership.count", 1 do
      post join_group_path(@group)
    end

    assert @group.members.exists?(id: @volunteer.id)
    assert_redirected_to group_path(@group)
  end

  test "join is idempotent and does not create duplicate memberships" do
    create(:group_membership, user: @volunteer, group: @group)
    sign_in @volunteer

    assert_no_difference "GroupMembership.count" do
      post join_group_path(@group)
    end
  end

  test "leave removes the current user's GroupMembership" do
    create(:group_membership, user: @volunteer, group: @group)
    sign_in @volunteer

    assert_difference "GroupMembership.count", -1 do
      delete leave_group_path(@group)
    end

    assert_not @group.members.exists?(id: @volunteer.id)
    assert_redirected_to group_path(@group)
  end

  # -- Add / Remove member (admin or leader only) --

  test "add_member requires admin or leader authorization" do
    sign_in @volunteer

    assert_raises(Pundit::NotAuthorizedError) do
      post add_member_group_path(@group), params: { user_id: create(:user).id }
    end
  end

  test "add_member succeeds for admin" do
    target_user = create(:user)
    sign_in @admin

    assert_difference "GroupMembership.count", 1 do
      post add_member_group_path(@group), params: { user_id: target_user.id }
    end

    assert @group.members.exists?(id: target_user.id)
    assert_redirected_to group_path(@group)
  end

  test "add_member succeeds for the group leader" do
    target_user = create(:user)
    sign_in @leader

    assert_difference "GroupMembership.count", 1 do
      post add_member_group_path(@group), params: { user_id: target_user.id }
    end

    assert @group.members.exists?(id: target_user.id)
  end

  test "remove_member requires admin or leader authorization" do
    member = create(:user)
    create(:group_membership, user: member, group: @group)
    sign_in @volunteer

    assert_raises(Pundit::NotAuthorizedError) do
      delete remove_member_group_path(@group), params: { user_id: member.id }
    end
  end

  test "remove_member succeeds for admin" do
    member = create(:user)
    create(:group_membership, user: member, group: @group)
    sign_in @admin

    assert_difference "GroupMembership.count", -1 do
      delete remove_member_group_path(@group), params: { user_id: member.id }
    end

    assert_not @group.members.exists?(id: member.id)
    assert_redirected_to group_path(@group)
  end
end
