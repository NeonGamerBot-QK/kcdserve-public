class CreateNotifications < ActiveRecord::Migration[8.1]
  def change
    create_table :notifications do |t|
      t.references :user, null: false, foreign_key: true
      t.string :kind
      t.string :title
      t.text :body
      t.datetime :read_at
      t.string :resource_type
      t.integer :resource_id

      t.timestamps
    end

    add_index :notifications, [:user_id, :read_at]
    add_index :notifications, [:resource_type, :resource_id]
  end
end
