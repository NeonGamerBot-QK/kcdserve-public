# frozen_string_literal: true

module Api
  module V1
    class CategoriesController < BaseController
      # GET /api/v1/categories
      # Returns all categories for filter chips and dropdowns.
      def index
        categories = Category.order(:name)

        render json: {
          categories: categories.map { |c| category_json(c) }
        }, status: :ok
      end

      private

      def category_json(category)
        {
          id: category.id,
          name: category.name,
          color: category.color,
          description: category.description
        }
      end
    end
  end
end
