# frozen_string_literal: true

module Admin
  # Admin review and management of all service hour submissions
  class ServiceHoursController < BaseController
    before_action :set_service_hour, only: [:show, :edit, :update, :review]

    def index
      @scope = ServiceHour.recent.includes(:user, :category, :group)
      @scope = @scope.where(status: params[:status]) if params[:status].present?
      @pagy, @service_hours = pagy(@scope)
    end

    def show; end

    def edit; end

    # Updates a service hour submission on behalf of a volunteer (staff only)
    def update
      @service_hour.assign_attributes(admin_service_hour_params)
      @service_hour.editor = current_user
      @service_hour.edited_at = Time.current

      if @service_hour.save
        redirect_to admin_service_hour_path(@service_hour), notice: "Service hour updated."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    # Approves or rejects a service hour submission with optional admin comment
    def review
      @service_hour.update!(
        status: params[:status],
        admin_comment: params[:admin_comment],
        reviewer: current_user,
        reviewed_at: Time.current
      )
      ServiceHourMailer.review_notification(@service_hour).deliver_later
      redirect_to admin_service_hours_path(status: :pending), notice: "Service hour #{params[:status]}."
    end

    private

    def set_service_hour
      @service_hour = ServiceHour.find(params[:id])
    end

    def admin_service_hour_params
      params.require(:service_hour).permit(
        :title, :hours, :description, :service_date,
        :category_id, :group_id, :opportunity_id, photos: []
      )
    end
  end
end
