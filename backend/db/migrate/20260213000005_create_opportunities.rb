# frozen_string_literal: true

class CreateOpportunities < ActiveRecord::Migration[8.1]
  def change
    create_table :opportunities do |t|
      t.string     :title,           null: false
      t.text       :description
      t.date       :date,            null: false
      t.time       :start_time
      t.time       :end_time
      t.string     :location
      t.decimal    :required_hours,  precision: 6, scale: 2
      t.integer    :max_volunteers
      t.boolean    :published,       default: false
      t.references :category,        foreign_key: true
      t.references :created_by,      foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :opportunities, :date
    add_index :opportunities, :published
  end
end
