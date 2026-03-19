# frozen_string_literal: true

module Api
  module V1
    class OpportunitiesController < BaseController
      include Pundit::Authorization

      before_action :set_opportunity, only: [:show, :signup, :withdraw]

      # GET /api/v1/opportunities
      # Returns paginated upcoming opportunities with optional category and search filters.
      def index
        scope = policy_scope(Opportunity).upcoming.includes(:category, :opportunity_signups)
        scope = scope.where(category_id: params[:category_id]) if params[:category_id].present?
        if params[:q].present?
          q = "%#{params[:q]}%"
          scope = scope.where("title ILIKE :q OR description ILIKE :q OR location ILIKE :q", q: q)
        end

        @pagy, opportunities = pagy(:offset, scope, limit: params[:limit] || 20)

        render json: {
          opportunities: opportunities.map { |o| opportunity_json(o) },
          pagy: pagy_metadata(@pagy)
        }, status: :ok
      end

      # GET /api/v1/opportunities/:id
      def show
        authorize @opportunity

        render json: {
          opportunity: opportunity_json(@opportunity)
        }, status: :ok
      end

      # POST /api/v1/opportunities/:id/signup
      def signup
        authorize @opportunity
        unless @opportunity.opportunity_signups.exists?(user: current_user)
          @opportunity.opportunity_signups.create!(user: current_user)
        end

        render json: { message: "Signed up successfully" }, status: :ok
      end

      # DELETE /api/v1/opportunities/:id/withdraw
      def withdraw
        authorize @opportunity, :signup?
        @opportunity.opportunity_signups.find_by(user: current_user)&.destroy

        render json: { message: "Withdrawn successfully" }, status: :ok
      end

      private

      def set_opportunity
        @opportunity = Opportunity.find(params[:id])
      end

      def opportunity_json(opportunity)
        {
          id: opportunity.id,
          title: opportunity.title,
          description: opportunity.description,
          date: opportunity.date.iso8601,
          start_time: opportunity.start_time&.strftime("%H:%M"),
          end_time: opportunity.end_time&.strftime("%H:%M"),
          location: opportunity.location,
          category: opportunity.category&.name,
          category_id: opportunity.category_id,
          max_volunteers: opportunity.max_volunteers,
          spots_remaining: opportunity.spots_remaining,
          full: opportunity.full?,
          signed_up: opportunity.opportunity_signups.any? { |s| s.user_id == current_user.id },
          required_hours: opportunity.required_hours&.to_f,
          created_at: opportunity.created_at.iso8601
        }
      end

      def pagy_metadata(pagy)
        {
          page: pagy.page,
          pages: pagy.pages,
          count: pagy.count
        }
      end
    end
  end
end
