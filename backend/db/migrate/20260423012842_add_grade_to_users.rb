class AddGradeToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :grade, :integer
  end
end
