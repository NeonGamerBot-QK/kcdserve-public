# frozen_string_literal: true

# Manages group CRUD and member management
class GroupsController < ApplicationController
  before_action :authenticate_user!, except: [ :index, :show ]
  before_action :set_group, only: [ :show, :edit, :update, :destroy, :join, :leave, :add_member, :remove_member ]

  def index
    @pagy, @groups = pagy(policy_scope(Group).includes(:leader).order(:name))
  end

  def show
    authorize @group
    @members = @group.members.includes(:service_hours)
    @total_hours = @group.total_approved_hours
    @is_member = user_signed_in? && @group.members.exists?(id: current_user.id)
  end

  def new
    @group = Group.new
    authorize @group
  end

  def create
    @group = Group.new(group_params)
    authorize @group

    if @group.save
      redirect_to @group, notice: "Group was successfully created."
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
    authorize @group
  end

  def update
    authorize @group
    if @group.update(group_params)
      redirect_to @group, notice: "Group was successfully updated."
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    authorize @group
    @group.destroy
    redirect_to groups_path, notice: "Group was successfully deleted.", status: :see_other
  end

  # Allows the current user to join a group
  def join
    authorize @group, :join?
    unless @group.members.exists?(id: current_user.id)
      @group.group_memberships.create!(user: current_user)
    end
    redirect_to @group, notice: "You have joined #{@group.name}."
  end

  # Allows the current user to leave a group
  def leave
    @group.group_memberships.find_by(user: current_user)&.destroy
    redirect_to @group, notice: "You have left #{@group.name}."
  end

  # Admin/leader action to add a member by user ID
  def add_member
    authorize @group, :manage_members?
    user = User.find(params[:user_id])
    @group.group_memberships.find_or_create_by!(user: user)
    redirect_to @group, notice: "#{user.full_name} added to #{@group.name}."
  end

  # Admin/leader action to remove a member by user ID
  def remove_member
    authorize @group, :manage_members?
    @group.group_memberships.find_by(user_id: params[:user_id])&.destroy
    redirect_to @group, notice: "Member removed from #{@group.name}."
  end

  private

  def set_group
    @group = Group.find(params[:id])
  end

  def group_params
    params.require(:group).permit(:name, :description, :leader_id, :logo, :invite_only)
  end
end
