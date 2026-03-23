# frozen_string_literal: true

class ApplicationController < ActionController::Base
  include Pundit::Authorization
  include Pagy::Method

  allow_browser versions: :modern
  stale_when_importmap_changes

  before_action :configure_permitted_parameters, if: :devise_controller?
  before_action :set_paper_trail_whodunnit

  # Rescue Pundit authorization errors with a 403 forbidden response
  rescue_from Pundit::NotAuthorizedError, with: :user_not_authorized
  rescue_from ActiveRecord::RecordNotFound, with: :record_not_found

  private

  # Permits additional Devise parameters for sign up and account update
  def configure_permitted_parameters
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :first_name, :last_name, :phone, :bio, :avatar ])
    devise_parameter_sanitizer.permit(:account_update, keys: [ :first_name, :last_name, :phone, :bio, :avatar ])
  end

  def user_not_authorized
    flash[:alert] = "You are not authorized to perform this action."
    redirect_back(fallback_location: root_path)
  end

  def record_not_found
    flash[:alert] = "The requested record was not found."
    redirect_back(fallback_location: root_path)
  end

  # Redirects with model validation errors in flash[:error]
  def redirect_with_errors(record, fallback_path)
    flash[:error] = record.errors.full_messages.to_sentence
    redirect_to fallback_path
  end
end
