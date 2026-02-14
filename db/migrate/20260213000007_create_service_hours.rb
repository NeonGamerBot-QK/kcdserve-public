# frozen_string_literal: true

# Service hour submissions track volunteer work logged by users.
# Status enum: pending (0), approved (1), rejected (2).
class CreateServiceHours < ActiveRecord::Migration[8.1]
  def change
    create_table :service_hours do |t|
      t.references :user,        null: false, foreign_key: true
      t.references :opportunity, foreign_key: true
      t.references :group,       foreign_key: true
      t.references :category,    foreign_key: true
      t.decimal    :hours,        null: false, precision: 6, scale: 2
      t.text       :description,  null: false
      t.date       :service_date, null: false
      t.integer    :status,       null: false, default: 0
      t.text       :admin_comment
      t.references :reviewed_by,  foreign_key: { to_table: :users }
      t.datetime   :reviewed_at

      t.timestamps
    end

    add_index :service_hours, :status
    add_index :service_hours, :service_date
  end
end
