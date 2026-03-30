# frozen_string_literal: true

class AddHoursSubmissionNotificationsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :hours_submission_notifications, :boolean, default: false, null: false
  end
end
