# frozen_string_literal: true

class AddSupervisorReviewToServiceHours < ActiveRecord::Migration[8.1]
  def change
    add_column :service_hours, :supervisor_token, :string
    add_column :service_hours, :supervisor_status, :integer
    add_index :service_hours, :supervisor_token, unique: true
  end
end
