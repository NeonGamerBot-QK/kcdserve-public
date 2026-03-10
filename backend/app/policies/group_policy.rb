# frozen_string_literal: true

# Authorization policy for Groups.
# Admins can fully manage groups. Group leaders can update their own groups.
class GroupPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    # Private groups are only visible to members, leaders, and staff
    return true unless record.invite_only?
    user.staff? || record.leader == user || record.members.exists?(id: user.id)
  end

  def join?
    return false if record.invite_only?
    true
  end

  def create?
    user.staff?
  end

  def update?
    user.admin_or_above? || record.leader == user
  end

  def destroy?
    user.admin_or_above?
  end

  # Determines if the user can manage group membership
  def manage_members?
    user.admin_or_above? || record.leader == user
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.staff?
        scope.all
      elsif user.present?
        # Show public groups + invite-only groups the user belongs to
        scope.left_joins(:group_memberships)
             .where("groups.invite_only = false OR group_memberships.user_id = ?", user.id)
             .distinct
      else
        scope.where(invite_only: false)
      end
    end
  end
end
