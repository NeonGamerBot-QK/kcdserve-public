# frozen_string_literal: true

# Authorization policy for ServiceHour submissions.
# Volunteers can manage their own submissions. Admins can review all submissions.
class ServiceHourPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    record.user == user || user.admin_or_above?
  end

  def create?
    user.present?
  end

  def update?
    record.user == user && record.pending?
  end

  def destroy?
    record.user == user && record.pending?
  end

  # Determines if the user can approve or reject an hour submission
  def review?
    user.admin_or_above?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user.admin_or_above?
        scope.all
      else
        scope.where(user: user)
      end
    end
  end
end
