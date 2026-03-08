# frozen_string_literal: true

module Admin
  # Admin management of service categories (admin-only, teachers cannot manage)
  class CategoriesController < BaseController
    before_action :require_admin!
    before_action :set_category, only: [:edit, :update, :destroy]

    def index
      @categories = Category.order(:name)
    end

    def new
      @category = Category.new
    end

    def create
      @category = Category.new(category_params)
      if @category.save
        redirect_to admin_categories_path, notice: "Category created."
      else
        render :new, status: :unprocessable_entity
      end
    end

    def edit; end

    def update
      if @category.update(category_params)
        redirect_to admin_categories_path, notice: "Category updated."
      else
        render :edit, status: :unprocessable_entity
      end
    end

    def destroy
      @category.destroy
      redirect_to admin_categories_path, notice: "Category deleted.", status: :see_other
    end

    private

    def set_category
      @category = Category.find(params[:id])
    end

    def category_params
      params.require(:category).permit(:name, :description, :color, :restitution)
    end
  end
end
