class AddInviteOnlyToGroups < ActiveRecord::Migration[8.1]
  def change
    add_column :groups, :invite_only, :boolean, default: false, null: false
  end
end
