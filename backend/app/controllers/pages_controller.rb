# frozen_string_literal: true

# Handles static/landing pages and the authenticated dashboard
class PagesController < ApplicationController
  def home
    if user_signed_in?
      redirect_to dashboard_path
    else
      @upcoming_opportunities = Opportunity.published.upcoming.limit(6)
    end
  end

  def dashboard
    authenticate_user!
    @recent_hours = current_user.service_hours.recent.limit(5)
    @total_hours = current_user.total_approved_hours
    @pending_count = current_user.service_hours.pending.count
    @groups = current_user.groups
    @upcoming_signups = current_user.signed_up_opportunities.upcoming.limit(5)
  end

  def feedback
  end
end
