# frozen_string_literal: true

# Authorization policy for User management.
# Admins and super admins can manage all users.
# Regular users can only view and update their own profiles.
class UserPolicy < ApplicationPolicy
  def index?
    user.staff?
  end

  def show?
    user == record || user.staff?
  end

  def update?
    user == record || user.admin_or_above?
  end

  def destroy?
    user.super_admin? && user != record
  end

  # Determines if the current user can change roles of the target user
  def manage_role?
    user.admin_or_above? && user != record
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user.staff?
        scope.all
      else
        scope.where(id: user.id)
      end
    end
  end
end
