# frozen_string_literal: true

# Handles volunteer profile viewing and editing
class ProfilesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user, only: [:show, :edit, :update]

  def show
    authorize @user, policy_class: UserPolicy
    @service_hours = @user.service_hours.approved.includes(:category).order(service_date: :desc)
    @total_hours = @user.total_approved_hours
    @hours_by_category = @user.service_hours.approved.joins(:category).group("categories.name").sum(:hours)
    @groups = @user.groups
  end

  def edit
    authorize @user, policy_class: UserPolicy
  end

  def update
    authorize @user, policy_class: UserPolicy
    if @user.update(profile_params)
      redirect_to profile_path(@user), notice: "Profile updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def profile_params
    params.require(:user).permit(:first_name, :last_name, :bio, :phone, :avatar)
  end
end
