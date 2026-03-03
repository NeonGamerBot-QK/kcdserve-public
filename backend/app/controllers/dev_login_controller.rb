# frozen_string_literal: true

class DevLoginController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [ :create, :promote ]

  def create
    user = User.first || User.create!(
      email: "dev@example.com",
      password: "password",
      password_confirmation: "password",
      first_name: "Dev",
      last_name: "User"
    )

    sign_in user
    redirect_to dashboard_path, notice: "Logged in as #{user.email}"
  end

  def promote
    user = current_user
    user.update!(role: :super_admin)
    redirect_to dashboard_path, notice: "Promoted to Super Admin!"
  end
end
