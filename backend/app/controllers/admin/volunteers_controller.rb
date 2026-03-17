# frozen_string_literal: true

module Admin
  # Displays all volunteers with their total hours for easy browsing
  class VolunteersController < BaseController
    def index
      @pagy, @volunteers = pagy(
        User.order(last_name: :asc, first_name: :asc)
          .includes(:groups)
      )
    end
  end
end
