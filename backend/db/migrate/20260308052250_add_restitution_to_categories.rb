class AddRestitutionToCategories < ActiveRecord::Migration[8.1]
  def change
    add_column :categories, :restitution, :boolean, default: false, null: false
  end
end
