# frozen_string_literal: true

class AddAttributesToServiceHours < ActiveRecord::Migration[8.1]
  def change
    add_column :service_hours, :on_campus, :boolean, default: false, null: false
    add_column :service_hours, :organization_name, :string
    add_column :service_hours, :contact_name, :string
    add_column :service_hours, :contact_email, :string
  end
end
