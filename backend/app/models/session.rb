class Session < ApplicationRecord
  belongs_to :user

  validates :token, presence: true, uniqueness: true
  validates :expires_at, presence: true

  scope :active, -> { where("expires_at > ?", Time.current) }

  # Returns true if this session hasn't expired yet
  def active?
    expires_at > Time.current
  end
end
