# frozen_string_literal: true

module Admin
  # Admin management of groups and group membership
  class GroupsController < BaseController
    before_action :set_group, only: [:show, :edit, :update, :destroy, :add_member, :remove_member]
    before_action :require_admin!, only: [:new, :create, :edit, :update, :destroy, :add_member, :remove_member]

    def index
      @pagy, @groups = pagy(Group.includes(:leader, :members).order(:name))
    end

    def show
      @members = @group.members.order(:last_name, :first_name)
      @total_hours = @group.total_approved_hours
      @available_users = User.where.not(id: @group.member_ids).order(:last_name, :first_name)
    end

    def new
      @group = Group.new
    end

    def create
      @group = Group.new(group_params)

      if @group.save
        redirect_to admin_group_path(@group), notice: "Group created successfully."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit; end

    def update
      if @group.update(group_params)
        redirect_to admin_group_path(@group), notice: "Group updated successfully."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @group.destroy
      redirect_to admin_groups_path, notice: "Group deleted.", status: :see_other
    end

    def add_member
      user = User.find(params[:user_id])
      @group.group_memberships.find_or_create_by!(user: user)
      redirect_to admin_group_path(@group), notice: "#{user.full_name} added to #{@group.name}."
    end

    def remove_member
      @group.group_memberships.find_by(user_id: params[:user_id])&.destroy
      redirect_to admin_group_path(@group), notice: "Member removed from #{@group.name}."
    end

    private

    def set_group
      @group = Group.find(params[:id])
    end

    def group_params
      params.require(:group).permit(:name, :description, :leader_id, :logo, :invite_only)
    end
  end
end
