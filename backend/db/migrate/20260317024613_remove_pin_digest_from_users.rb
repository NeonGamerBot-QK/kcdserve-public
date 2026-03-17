class RemovePinDigestFromUsers < ActiveRecord::Migration[8.1]
  def change
    remove_column :users, :pin_digest, :string
  end
end
