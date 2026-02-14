# frozen_string_literal: true

# Background job that sends reminder emails for opportunities happening tomorrow
class OpportunityReminderJob < ApplicationJob
  queue_as :default

  # Finds all opportunities happening tomorrow and notifies signed-up volunteers
  def perform
    Opportunity.published.where(date: Date.tomorrow).find_each do |opportunity|
      opportunity.volunteers.find_each do |volunteer|
        OpportunityMailer.reminder(opportunity, volunteer).deliver_later
      end
    end
  end
end
