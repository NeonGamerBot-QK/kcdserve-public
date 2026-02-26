# frozen_string_literal: true

module Admin
  # Base controller for the admin namespace.
  # Ensures only admin or super_admin users can access admin pages.
  class BaseController < ApplicationController
    before_action :authenticate_user!
    before_action :require_admin!

    layout "admin"

    private

    # Redirects non-admin users away from the admin area
    def require_admin!
      unless current_user.admin_or_above?
        redirect_to root_path, alert: "You are not authorized to access the admin area."
      end
    end
  end
end
