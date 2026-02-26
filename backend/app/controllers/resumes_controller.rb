# frozen_string_literal: true

# Handles on-demand PDF service resume generation and download
class ResumesController < ApplicationController
  before_action :authenticate_user!

  # Generates and sends a PDF service resume for the specified user
  def show
    @user = User.find(params[:id])
    authorize @user, :show?, policy_class: UserPolicy

    pdf = ResumeGeneratorService.new(@user).generate
    send_data pdf, filename: "service_resume_#{@user.full_name.parameterize}.pdf",
                   type: "application/pdf",
                   disposition: "attachment"
  end
end
