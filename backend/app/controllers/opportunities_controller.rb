# frozen_string_literal: true

# Manages volunteer opportunity CRUD and public listing/signup
class OpportunitiesController < ApplicationController
  before_action :authenticate_user!, except: [:index, :show]
  before_action :set_opportunity, only: [:show, :edit, :update, :destroy, :signup, :withdraw]

  def index
    @pagy, @opportunities = pagy(policy_scope(Opportunity).upcoming.includes(:category))
  end

  def show
    authorize @opportunity
    @signed_up = user_signed_in? && @opportunity.opportunity_signups.exists?(user: current_user)
  end

  def new
    @opportunity = Opportunity.new
    authorize @opportunity
  end

  def create
    @opportunity = Opportunity.new(opportunity_params)
    @opportunity.creator = current_user
    authorize @opportunity

    if @opportunity.save
      redirect_to @opportunity, notice: "Opportunity was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize @opportunity
  end

  def update
    authorize @opportunity
    if @opportunity.update(opportunity_params)
      redirect_to @opportunity, notice: "Opportunity was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @opportunity
    @opportunity.destroy
    redirect_to opportunities_path, notice: "Opportunity was successfully deleted.", status: :see_other
  end

  # Allows a logged-in volunteer to sign up for an opportunity
  def signup
    authorize @opportunity
    unless @opportunity.opportunity_signups.exists?(user: current_user)
      @opportunity.opportunity_signups.create!(user: current_user)
    end
    redirect_to @opportunity, notice: "You have signed up for this opportunity!"
  end

  # Allows a logged-in volunteer to withdraw from an opportunity
  def withdraw
    authorize @opportunity, :signup?
    @opportunity.opportunity_signups.find_by(user: current_user)&.destroy
    redirect_to @opportunity, notice: "You have withdrawn from this opportunity."
  end

  private

  def set_opportunity
    @opportunity = Opportunity.find(params[:id])
  end

  def opportunity_params
    params.require(:opportunity).permit(
      :title, :description, :date, :start_time, :end_time,
      :location, :required_hours, :max_volunteers, :published,
      :category_id, photos: []
    )
  end
end
