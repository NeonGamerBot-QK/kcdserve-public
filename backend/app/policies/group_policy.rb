# frozen_string_literal: true

# Authorization policy for Groups.
# Admins can fully manage groups. Group leaders can update their own groups.
class GroupPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  def create?
    user.admin_or_above?
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
      scope.all
    end
  end
end
