# frozen_string_literal: true

# Authorization policy for service Categories.
# Categories are visible to all but only manageable by admins.
class CategoryPolicy < ApplicationPolicy
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
    user.admin_or_above?
  end

  def destroy?
    user.admin_or_above?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      scope.all
    end
  end
end
