# frozen_string_literal: true

# Sends email notifications related to volunteer opportunities
class OpportunityMailer < ApplicationMailer
  # Sends a reminder email to volunteers signed up for an upcoming opportunity
  #
  # @param opportunity [Opportunity] the upcoming opportunity
  # @param user [User] the volunteer to remind
  def reminder(opportunity, user)
    @opportunity = opportunity
    @user = user

    mail(
      to: @user.email,
      subject: "Reminder: #{@opportunity.title} is coming up!"
    )
  end
end
