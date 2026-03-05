# frozen_string_literal: true

# Handles on-demand PDF service resume generation and CSV hours export.
# Supports format=csv to download a full spreadsheet of all approved hours.
class ResumesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_and_authorize_user

  # Generates and sends a PDF service resume for the specified user
  def show
    pdf = ResumeGeneratorService.new(@user).generate
    send_data pdf, filename: "service_resume_#{@user.full_name.parameterize}.pdf",
                   type: "application/pdf",
                   disposition: "attachment"
  end

  # Exports all approved service hours as CSV for the specified user
  def export_csv
    service_hours = @user.service_hours.approved
      .includes(:category, :opportunity, :group)
      .order(service_date: :desc)

    csv_data = CSV.generate(headers: true) do |csv|
      csv << [
        "Date", "Title", "Category", "Opportunity", "Group",
        "Hours", "On Campus", "Organization", "Contact Name",
        "Contact Email", "Description"
      ]
      service_hours.each do |sh|
        csv << [
          sh.service_date.to_s,
          sh.title,
          sh.category&.name,
          sh.opportunity&.title,
          sh.group&.name,
          sh.hours.to_f,
          sh.on_campus? ? "Yes" : "No",
          sh.organization_name,
          sh.contact_name,
          sh.contact_email,
          sh.description
        ]
      end
    end

    send_data csv_data,
              filename: "service_hours_#{@user.full_name.parameterize}_#{Date.current}.csv",
              type: "text/csv",
              disposition: "attachment"
  end

  private

  # Loads the user and authorizes access via Pundit
  def set_and_authorize_user
    @user = User.find(params[:id])
    authorize @user, :show?, policy_class: UserPolicy
  end
end
