# frozen_string_literal: true

require "test_helper"

class ServiceHourMailerTest < ActionMailer::TestCase
  # Verifies that submission_received sends an email to all admin and super_admin users
  test "submission_received sends to all admin emails" do
    admin = create(:user, :admin, email: "admin@example.com")
    super_admin = create(:user, :super_admin, email: "superadmin@example.com")
    service_hour = create(:service_hour)

    email = ServiceHourMailer.submission_received(service_hour)
    email.deliver_now

    assert_equal 1, ActionMailer::Base.deliveries.size

    delivered = ActionMailer::Base.deliveries.last
    assert_includes delivered.to, admin.email
    assert_includes delivered.to, super_admin.email
  end

  # Verifies that the subject line includes the submitting user's full name
  test "submission_received has correct subject with user name" do
    create(:user, :admin)
    volunteer = create(:user, first_name: "Alice", last_name: "Smith")
    service_hour = create(:service_hour, user: volunteer)

    ServiceHourMailer.submission_received(service_hour).deliver_now

    delivered = ActionMailer::Base.deliveries.last
    assert_equal "New Service Hour Submission from Alice Smith", delivered.subject
  end

  # Verifies that no email is sent when there are no admin users in the system
  test "submission_received does not send when no admins exist" do
    service_hour = create(:service_hour)

    ServiceHourMailer.submission_received(service_hour).deliver_now

    assert_empty ActionMailer::Base.deliveries
  end

  # Verifies that review_notification sends to the volunteer's email address
  test "review_notification sends to the volunteer email" do
    volunteer = create(:user, email: "volunteer@example.com")
    service_hour = create(:service_hour, :approved, user: volunteer)

    ServiceHourMailer.review_notification(service_hour).deliver_now

    assert_equal 1, ActionMailer::Base.deliveries.size

    delivered = ActionMailer::Base.deliveries.last
    assert_equal ["volunteer@example.com"], delivered.to
  end

  # Verifies that the review_notification subject includes "approved" when the hour is approved
  test "review_notification subject includes approved status" do
    service_hour = create(:service_hour, :approved)

    ServiceHourMailer.review_notification(service_hour).deliver_now

    delivered = ActionMailer::Base.deliveries.last
    assert_equal "Your service hour submission has been approved", delivered.subject
  end

  # Verifies that the review_notification subject includes "rejected" when the hour is rejected
  test "review_notification subject includes rejected status" do
    service_hour = create(:service_hour, :rejected)

    ServiceHourMailer.review_notification(service_hour).deliver_now

    delivered = ActionMailer::Base.deliveries.last
    assert_equal "Your service hour submission has been rejected", delivered.subject
  end
end
