# frozen_string_literal: true

# Sends email notifications related to service hour submissions and reviews
class ServiceHourMailer < ApplicationMailer
  # Notifies admins when a new service hour submission is received
  #
  # @param service_hour [ServiceHour] the submitted service hour record
  def submission_received(service_hour)
    @service_hour = service_hour
    @user = service_hour.user

    admin_emails = User.where(role: [ :admin, :super_admin ], hours_submission_notifications: true).pluck(:email)
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

  # Emails the supervisor/contact asking them to approve or reject the submitted hours.
  # Only called when contact_email is present on the service hour.
  #
  # @param service_hour [ServiceHour] the submitted service hour record
  def supervisor_review_request(service_hour)
    @service_hour = service_hour
    @user = service_hour.user
    @approve_url = supervisor_review_approve_url(@service_hour.supervisor_token)
    @reject_url  = supervisor_review_reject_url(@service_hour.supervisor_token)

    mail(
      to: service_hour.contact_email,
      subject: "[Action Required]: Please verify #{@user.full_name}'s service hours"
    )
  end
end
