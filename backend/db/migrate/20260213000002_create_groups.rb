# frozen_string_literal: true

class CreateGroups < ActiveRecord::Migration[8.1]
  def change
    create_table :groups do |t|
      t.string     :name,        null: false
      t.text       :description
      t.references :leader,      foreign_key: { to_table: :users }

      t.timestamps
    end

    add_index :groups, :name, unique: true
  end
end
