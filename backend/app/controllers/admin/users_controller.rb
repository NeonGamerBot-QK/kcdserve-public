# frozen_string_literal: true

module Admin
  # Admin management of user accounts and role assignments
  class UsersController < BaseController
    before_action :set_user, only: [:show, :edit, :update, :destroy]
    before_action :require_admin!, only: [:edit, :update, :destroy]

    def index
      @pagy, @users = pagy(User.order(:last_name, :first_name))
    end

    def show
      @service_hours = @user.service_hours.recent.includes(:category)
    end

    def edit; end

    def update
      if @user.update(user_params)
        redirect_to admin_user_path(@user), notice: "User updated successfully."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      if @user == current_user
        redirect_to admin_users_path, alert: "You cannot delete your own account."
      else
        @user.destroy
        redirect_to admin_users_path, notice: "User deleted.", status: :see_other
      end
    end

    private

    def set_user
      @user = User.find(params[:id])
    end

    def user_params
      params.require(:user).permit(:first_name, :last_name, :email, :role, :bio, :phone)
    end
  end
end
