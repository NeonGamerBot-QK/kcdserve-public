class AddLoginPinToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :login_pin, :string
    add_column :users, :login_pin_sent_at, :datetime
  end
end
