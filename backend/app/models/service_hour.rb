class ServiceHour < ApplicationRecord
  has_paper_trail

  # Associations
  belongs_to :user
  belongs_to :opportunity, optional: true
  belongs_to :group, optional: true
  belongs_to :category
  belongs_to :reviewer, class_name: "User", foreign_key: :reviewed_by_id, optional: true
  belongs_to :editor, class_name: "User", foreign_key: :edited_by_id, optional: true, inverse_of: :edited_hours

  # Active Storage
  has_many_attached :photos

  # Status enum: pending=0, approved=1, rejected=2
  enum :status, { pending: 0, approved: 1, rejected: 2 }

  # Validations
  validates :hours, presence: true, numericality: { greater_than: 0 }
  validates :description, presence: true
  validates :service_date, presence: true
  validates :title, length: { maximum: 100 }

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_date_range, ->(start_date, end_date) { where(service_date: start_date..end_date) }
end
