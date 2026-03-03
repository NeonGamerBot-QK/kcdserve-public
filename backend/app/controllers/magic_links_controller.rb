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
    user = User.find_by(email: params[:user][:email])

    if user
      user.send_magic_link
      redirect_to root_path, notice: "Check your email for the login link!"
    else
      redirect_to root_path, alert: "No account found with that email."
    end
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
