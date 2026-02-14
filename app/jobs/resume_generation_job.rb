# frozen_string_literal: true

# Background job that generates a PDF service resume for a volunteer
class ResumeGenerationJob < ApplicationJob
  queue_as :default

  # Generates the resume PDF and attaches it to the user
  #
  # @param user_id [Integer] the ID of the user to generate a resume for
  def perform(user_id)
    user = User.find(user_id)
    pdf = ResumeGeneratorService.new(user).generate
    user.avatar.attach(io: StringIO.new(pdf), filename: "service_resume_#{user.id}.pdf", content_type: "application/pdf")
  end
end
