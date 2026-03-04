# frozen_string_literal: true

# Authorization policy for ServiceHour submissions.
# Volunteers can manage their own submissions. Admins can review all submissions.
class ServiceHourPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    record.user == user || user.staff?
  end

  def create?
    user.present?
  end

  def update?
    (record.user == user && record.pending?) || user.staff?
  end

  def destroy?
    record.user == user && record.pending?
  end

  # Determines if the user can approve or reject an hour submission
  def review?
    user.staff?
  end

  class Scope < ApplicationPolicy::Scope
    def resolve
      if user.staff?
        scope.all
      else
        scope.where(user: user)
      end
    end
  end
end
