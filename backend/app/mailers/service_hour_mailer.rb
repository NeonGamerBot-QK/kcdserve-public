# frozen_string_literal: true

# Sends email notifications related to service hour submissions and reviews
class ServiceHourMailer < ApplicationMailer
  # Notifies admins when a new service hour submission is received
  #
  # @param service_hour [ServiceHour] the submitted service hour record
  def submission_received(service_hour)
    @service_hour = service_hour
    @user = service_hour.user

    admin_emails = User.where(role: [:admin, :super_admin]).pluck(:email)
    return if admin_emails.empty?

    mail(
      to: admin_emails,
      subject: "New Service Hour Submission from #{@user.full_name}"
    )
  end

  # Notifies the volunteer when their service hour submission has been reviewed
  #
  # @param service_hour [ServiceHour] the reviewed service hour record
  def review_notification(service_hour)
    @service_hour = service_hour
    @user = service_hour.user

    mail(
      to: @user.email,
      subject: "Your service hour submission has been #{@service_hour.status}"
    )
  end
end
