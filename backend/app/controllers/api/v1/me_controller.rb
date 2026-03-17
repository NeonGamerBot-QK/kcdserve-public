# frozen_string_literal: true

module Api
  module V1
    class MeController < BaseController
      # GET /api/v1/me
      # Returns the authenticated user's profile.
      def show
        render json: {
          user: {
            id: current_user.id,
            email: current_user.email,
            first_name: current_user.first_name,
            last_name: current_user.last_name,
            role: current_user.role,
            phone: current_user.phone,
            bio: current_user.bio,
            birthday: current_user.birthday,
            total_approved_hours: current_user.total_approved_hours
          }
        }, status: :ok
      end
    end
  end
end
