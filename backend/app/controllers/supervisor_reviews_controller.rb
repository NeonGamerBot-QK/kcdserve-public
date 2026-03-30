# frozen_string_literal: true

# Handles supervisor approval/rejection of service hours via tokenized email links.
# No authentication is required — access is gated by the unique supervisor_token.
class SupervisorReviewsController < ApplicationController
  before_action :set_service_hour

  # GET /supervisor_review/:token/approve
  def approve
    if @service_hour.supervisor_status.present?
      @already_reviewed = true
      render :already_reviewed and return
    end

    @service_hour.update!(supervisor_status: :approved)
    render :approved
  end

  # GET /supervisor_review/:token/reject
  def reject
    if @service_hour.supervisor_status.present?
      @already_reviewed = true
      render :already_reviewed and return
    end

    @service_hour.update!(
      supervisor_status: :rejected,
      status: :rejected,
      reviewed_at: Time.current
    )

    # Notify the student that their hours were rejected by the supervisor.
    ServiceHourMailer.review_notification(@service_hour).deliver_later

    render :rejected
  end

  private

  def set_service_hour
    @service_hour = ServiceHour.find_by!(supervisor_token: params[:token])
  rescue ActiveRecord::RecordNotFound
    render plain: "This link is invalid or has expired.", status: :not_found
  end
end
