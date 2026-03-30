# frozen_string_literal: true

# Manages service hour submission, listing, and admin review workflow
class ServiceHoursController < ApplicationController
  before_action :authenticate_user!
  before_action :set_service_hour, only: [ :show, :edit, :update, :destroy, :review ]

  def index
    @pagy, @service_hours = pagy(policy_scope(ServiceHour).recent.includes(:user, :category, :group))
  end

  def show
    authorize @service_hour
  end

  def new
    @service_hour = current_user.service_hours.build
    authorize @service_hour
  end

  def create
    @service_hour = current_user.service_hours.build(service_hour_params)
    authorize @service_hour

    if @service_hour.save
      ServiceHourMailer.submission_received(@service_hour).deliver_later
      ServiceHourMailer.supervisor_review_request(@service_hour).deliver_later if @service_hour.contact_email.present?
      redirect_to @service_hour, notice: "Service hours submitted for approval."
    else
      redirect_with_errors(@service_hour, new_service_hour_path)
    end
  end

  def edit
    authorize @service_hour
  end

  def update
    authorize @service_hour

    # Track when staff members edit another user's submission
    if current_user.staff? && @service_hour.user != current_user
      @service_hour.assign_attributes(service_hour_params)
      @service_hour.editor = current_user
      @service_hour.edited_at = Time.current
      success = @service_hour.save
    else
      success = @service_hour.update(service_hour_params)
    end

    if success
      redirect_to @service_hour, notice: "Service hours updated."
    else
      redirect_with_errors(@service_hour, edit_service_hour_path(@service_hour))
    end
  end

  def destroy
    authorize @service_hour
    @service_hour.destroy
    redirect_to service_hours_path, notice: "Service hours deleted.", status: :see_other
  end

  # Admin action to approve or reject a service hour submission
  def review
    authorize @service_hour
    @service_hour.update!(
      status: params[:status],
      admin_comment: params[:admin_comment],
      reviewer: current_user,
      reviewed_at: Time.current
    )
    Notification.create!(
      user: @service_hour.user,
      kind: "service_hour_reviewed",
      title: "Hours #{params[:status].capitalize}",
      body: "Your #{@service_hour.hours}h submission has been #{params[:status]}.",
      resource_type: "ServiceHour",
      resource_id: @service_hour.id
    )
    ServiceHourMailer.review_notification(@service_hour).deliver_later
    redirect_to @service_hour, notice: "Service hour #{params[:status]}."
  end

  private

  def set_service_hour
    @service_hour = ServiceHour.find(params[:id])
  end

  def service_hour_params
    params.require(:service_hour).permit(
      :title, :hours, :description, :service_date, :category_id,
      :group_id, :opportunity_id, :on_campus, :organization_name,
      :location, :contact_name, :contact_email, photos: []
    )
  end
end
