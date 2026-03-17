# frozen_string_literal: true

module Api
  module V1
    class MeController < BaseController
      # GET /api/v1/me
      # Returns the authenticated user's profile.
      def show
        render json: { user: user_json }, status: :ok
      end

      # PATCH /api/v1/me
      # Updates the authenticated user's profile.
      def update
        if current_user.update(profile_params)
          render json: { user: user_json }, status: :ok
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def user_json
        {
          id: current_user.id,
          email: current_user.email,
          first_name: current_user.first_name,
          last_name: current_user.last_name,
          role: current_user.role,
          phone: current_user.phone,
          bio: current_user.bio,
          birthday: current_user.birthday,
          avatar_url: active_storage_url(current_user.avatar),
          total_approved_hours: current_user.total_approved_hours
        }
      end

      def profile_params
        params.require(:user).permit(:first_name, :last_name, :bio, :phone, :birthday, :avatar)
      end
    end
  end
end
