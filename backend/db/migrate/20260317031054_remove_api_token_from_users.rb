class RemoveApiTokenFromUsers < ActiveRecord::Migration[8.1]
  def change
    remove_column :users, :api_token, :string
    remove_column :users, :api_token_expires_at, :datetime
  end
end
