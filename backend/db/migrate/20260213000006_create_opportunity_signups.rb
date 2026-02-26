# frozen_string_literal: true

class CreateOpportunitySignups < ActiveRecord::Migration[8.1]
  def change
    create_table :opportunity_signups do |t|
      t.references :user,        null: false, foreign_key: true
      t.references :opportunity, null: false, foreign_key: true
      t.boolean    :attended,    default: false

      t.timestamps
    end

    add_index :opportunity_signups, %i[user_id opportunity_id], unique: true
  end
end
