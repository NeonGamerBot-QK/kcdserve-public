# frozen_string_literal: true

module Admin
  # Displays PaperTrail version history as a searchable audit log
  class AuditLogController < BaseController
    before_action :require_super_admin!

    def index
      scope = PaperTrail::Version.order(created_at: :desc)

      # Filter by model type
      scope = scope.where(item_type: params[:model]) if params[:model].present?

      # Filter by event type (create, update, destroy)
      scope = scope.where(event: params[:event]) if params[:event].present?

      # Filter by user who made the change
      scope = scope.where(whodunnit: params[:whodunnit]) if params[:whodunnit].present?

      # Filter by item ID
      scope = scope.where(item_id: params[:item_id]) if params[:item_id].present?

      # Filter by date range
      scope = scope.where(created_at: Date.parse(params[:from])..) if params[:from].present?
      scope = scope.where(created_at: ..Date.parse(params[:to]).end_of_day) if params[:to].present?

      @pagy, @versions = pagy(scope, limit: 50)

      # Collect tracked model names for the filter dropdown
      @tracked_models = PaperTrail::Version.distinct.pluck(:item_type).sort
    end

    def show
      @version = PaperTrail::Version.find(params[:id])
    end
  end
end
