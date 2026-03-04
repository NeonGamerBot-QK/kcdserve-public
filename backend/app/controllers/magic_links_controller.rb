# frozen_string_literal: true

class MagicLinksController < ApplicationController
  skip_before_action :verify_authenticity_token

  def show
    if params[:token].present?
      login_with_token
    else
      @user = User.new
    end
  end

  def create
    email = params[:email]&.strip&.downcase

    if email.blank?
      redirect_to root_path, alert: "Please enter an email address."
      return
    end

    # Find existing user or create a new one (sign-up via magic link)
    user = User.find_by(email: email)
    unless user
      user = User.create!(
        email: email,
        password: Devise.friendly_token(20),
        first_name: params[:first_name].presence || email.split("@").first.capitalize,
        last_name: params[:last_name].presence || ""
      )
    end

    user.send_magic_link
    redirect_to root_path, notice: "Check your email for the login link!"
  end

  private

  def login_with_token
    user = User.find_by(magic_link_token: params[:token])

    if user&.magic_link_valid?
      user.update!(magic_link_token: nil, magic_link_sent_at: nil)
      sign_in user
      redirect_to dashboard_path, notice: "Welcome back, #{user.first_name}!"
    else
      redirect_to root_path, alert: "Invalid or expired login link."
    end
  end
end
