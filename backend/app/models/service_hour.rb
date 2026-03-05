class ServiceHour < ApplicationRecord
  has_paper_trail

  # Associations
  # Bypass User's default_scope so hours remain accessible after soft-deletion
  belongs_to :user, -> { unscope(where: :deleted_at) }
  belongs_to :opportunity, optional: true
  belongs_to :group, optional: true
  belongs_to :category
  belongs_to :reviewer, -> { unscope(where: :deleted_at) }, class_name: "User", foreign_key: :reviewed_by_id, optional: true
  belongs_to :editor, -> { unscope(where: :deleted_at) }, class_name: "User", foreign_key: :edited_by_id, optional: true, inverse_of: :edited_hours

  # Active Storage
  has_many_attached :photos

  # Status enum: pending=0, approved=1, rejected=2
  enum :status, { pending: 0, approved: 1, rejected: 2 }

  # Validations
  validates :hours, presence: true, numericality: { greater_than: 0 }
  validates :description, presence: true
  validates :service_date, presence: true
  validates :title, length: { maximum: 100 }
  validates :contact_email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :organization_name, length: { maximum: 150 }
  validates :contact_name, length: { maximum: 100 }
  validates :contact_email, length: { maximum: 150 }

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_date_range, ->(start_date, end_date) { where(service_date: start_date..end_date) }
  scope :on_campus, -> { where(on_campus: true) }
end
