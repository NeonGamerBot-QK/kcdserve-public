# frozen_string_literal: true

# Authorization policy for volunteer Opportunities.
# Published opportunities are visible to everyone. Only admins can create/manage.
class OpportunityPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    record.published? || user&.admin_or_above?
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

  # Determines if the user can sign up for this opportunity
  def signup?
    user.present? && record.published? && !record.full?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user&.admin_or_above?
        scope.all
      else
        scope.published
      end
    end
  end
end
