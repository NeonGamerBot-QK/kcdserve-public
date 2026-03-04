# frozen_string_literal: true

# Adds a title field and staff edit tracking columns to service hours.
# title: optional short summary for the service hour entry.
# edited_by_id/edited_at: tracks when staff members edit a submission.
class AddTitleAndEditTrackingToServiceHours < ActiveRecord::Migration[8.1]
  def change
    add_column :service_hours, :title, :string
    add_reference :service_hours, :edited_by, foreign_key: { to_table: :users }, null: true
    add_column :service_hours, :edited_at, :datetime
  end
end
