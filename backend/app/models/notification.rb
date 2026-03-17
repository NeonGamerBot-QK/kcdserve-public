# frozen_string_literal: true

class Notification < ApplicationRecord
  belongs_to :user, -> { unscope(where: :deleted_at) }

  validates :kind, presence: true
  validates :title, presence: true

  scope :unread, -> { where(read_at: nil) }
  scope :recent, -> { order(created_at: :desc) }

  # Mark this notification as read
  def mark_as_read!
    update!(read_at: Time.current) if read_at.nil?
  end
end
