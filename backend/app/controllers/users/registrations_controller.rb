# frozen_string_literal: true

module Users
  # Redirects traditional registration to the magic link flow on the home page
  class RegistrationsController < Devise::RegistrationsController
    skip_before_action :verify_authenticity_token, raise: false

    # Redirect sign-up form to home page (magic link handles registration)
    def new
      redirect_to root_path, notice: "Use the magic link form to sign up."
    end

    # Block direct POST to the registration endpoint
    def create
      redirect_to root_path, alert: "Please use the magic link to create an account."
    end
  end
end
