# frozen_string_literal: true

module Admin
  # Admin management of user accounts, role assignments, and soft deletion
  class UsersController < BaseController
    before_action :set_user, only: [ :show, :edit, :update, :destroy, :restore, :add_to_group, :remove_from_group, :inline_update ]
    before_action :require_admin!, only: [ :new, :create, :edit, :update, :destroy, :restore, :add_to_group, :remove_from_group, :spreadsheet, :inline_update ]

    def index
      @pagy, @users = pagy(User.order(:last_name, :first_name))
    end

    # Lists soft-deleted users, with a filter for records deleted 7+ years ago
    def archived
      scope = User.only_deleted.order(:last_name, :first_name)
      scope = scope.deleted_over_7_years_ago if params[:filter] == "7_years"
      @pagy, @users = pagy(scope)
    end

    def show
      @service_hours = @user.service_hours.recent.includes(:category)
      @user_groups = @user.groups.order(:name)
      @available_groups = Group.where.not(id: @user.group_ids).order(:name)
    end

    def new
      @user = User.new
    end

    def create
      @user = User.new(user_params)
      @user.password = SecureRandom.hex(16)

      if @user.save
        redirect_to admin_user_path(@user), notice: "User created successfully."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit; end

    def update
      if @user.update(user_params)
        redirect_to admin_user_path(@user), notice: "User updated successfully."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    # Soft-deletes the user instead of permanently destroying them
    def destroy
      if @user == current_user
        redirect_to admin_users_path, alert: "You cannot delete your own account."
      else
        @user.soft_delete!
        redirect_to admin_users_path, notice: "User has been deactivated.", status: :see_other
      end
    end

    # Airtable-style spreadsheet view for bulk inline editing
    def spreadsheet
      @users = User.includes(:groups).order(:last_name, :first_name)
      @all_groups = Group.order(:name)
    end

    # Restores a previously soft-deleted user
    def restore
      @user.restore!
      redirect_to admin_user_path(@user), notice: "User has been restored."
    end

    # Adds the user to a group by group ID
    def add_to_group
      group = Group.find(params[:group_id])
      @user.group_memberships.find_or_create_by!(group: group)
      redirect_to admin_user_path(@user), notice: "#{@user.full_name} added to #{group.name}."
    end

    # Removes the user from a group by group ID
    def remove_from_group
      @user.group_memberships.find_by(group_id: params[:group_id])&.destroy
      redirect_to admin_user_path(@user), notice: "Removed from group."
    end

    # Inline update for spreadsheet view (JSON endpoint)
    def inline_update
      if @user.update(inline_update_params)
        render json: { success: true }
      else
        render json: { success: false, errors: @user.errors.full_messages }, status: :unprocessable_entity
      end
    end

    private

    # Finds users including soft-deleted ones so admins can view/restore archived records
    def set_user
      @user = User.with_deleted.find(params[:id])
    end

    def user_params
      params.require(:user).permit(:first_name, :last_name, :email, :role, :bio, :phone, :birthday, :grade, :hours_submission_notifications)
    end

    def inline_update_params
      params.require(:user).permit(:first_name, :last_name, :email, :role, :phone, :grade)
    end
  end
end
