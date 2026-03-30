# frozen_string_literal: true

# Handles supervisor approval/rejection of service hours via tokenized email links.
# No authentication is required — access is gated by the unique supervisor_token.
class SupervisorReviewsController < ApplicationController
  before_action :set_service_hour
  before_action :check_already_reviewed, only: [ :approve, :reject_form, :reject ]

  # GET /supervisor_review/:token/approve
  def approve
    @service_hour.update!(supervisor_status: :approved)
    render :approved
  end

  # GET /supervisor_review/:token/reject
  # Shows the rejection reason form.
  def reject_form
  end

  # POST /supervisor_review/:token/reject
  # Processes the rejection with a required reason.
  def reject
    reason = params[:reason].to_s.strip

    if reason.blank?
      flash.now[:error] = "Please provide a reason for rejecting these hours."
      render :reject_form, status: :unprocessable_entity and return
    end

    @service_hour.update!(
      supervisor_status: :rejected,
      status: :rejected,
      admin_comment: reason,
      reviewed_at: Time.current
    )

    ServiceHourMailer.review_notification(@service_hour).deliver_later

    render :rejected
  end

  private

  def set_service_hour
    @service_hour = ServiceHour.find_by!(supervisor_token: params[:token])
  rescue ActiveRecord::RecordNotFound
    render plain: "This link is invalid or has expired.", status: :not_found
  end

  def check_already_reviewed
    render :already_reviewed if @service_hour.supervisor_status.present?
  end
end
