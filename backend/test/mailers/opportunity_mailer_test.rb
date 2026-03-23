# frozen_string_literal: true

require "test_helper"

class OpportunityMailerTest < ActionMailer::TestCase
  # Verifies that the reminder email is sent to the correct user's email address
  test "reminder sends to the user email" do
    user = create(:user, email: "volunteer@example.com")
    opportunity = create(:opportunity, title: "Park Cleanup")

    OpportunityMailer.reminder(opportunity, user).deliver_now

    assert_equal 1, ActionMailer::Base.deliveries.size

    delivered = ActionMailer::Base.deliveries.last
    assert_equal [ "volunteer@example.com" ], delivered.to
  end

  # Verifies that the reminder subject line includes the opportunity title
  test "reminder subject includes opportunity title" do
    user = create(:user)
    opportunity = create(:opportunity, title: "Beach Restoration Day")

    OpportunityMailer.reminder(opportunity, user).deliver_now

    delivered = ActionMailer::Base.deliveries.last
    assert_equal "Reminder: Beach Restoration Day is coming up!", delivered.subject
  end
end
