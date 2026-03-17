class AddLocationToServiceHours < ActiveRecord::Migration[8.1]
  def change
    add_column :service_hours, :location, :string
  end
end
