# frozen_string_literal: true

module Admin
  # Base controller for the admin namespace.
  # Ensures only staff-level users (teacher, admin, super_admin) can access admin pages.
  class BaseController < ApplicationController
    before_action :authenticate_user!
    before_action :require_staff!

    layout "admin"

    private

    # Redirects non-staff users away from the admin area
    def require_staff!
      unless current_user.staff?
        redirect_to root_path, alert: "You are not authorized to access the admin area."
      end
    end

    # Restricts actions to admin or super_admin only (excludes teachers)
    def require_admin!
      unless current_user.admin_or_above?
        redirect_to admin_root_path, alert: "You do not have permission to perform this action."
      end
    end

    # Restricts actions to super_admin only
    def require_super_admin!
      unless current_user.super_admin?
        redirect_to admin_root_path, alert: "You do not have permission to perform this action."
      end
    end
  end
end
