class AddMagicLinkFieldsToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :magic_link_token, :string
    add_column :users, :magic_link_sent_at, :datetime
  end
end
