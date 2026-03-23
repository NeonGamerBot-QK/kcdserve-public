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
  validates :hours, presence: true, numericality: { greater_than: 0, less_than_or_equal_to: 24 }
  validates :description, presence: true, length: { minimum: 10, maximum: 2000 }
  validates :service_date, presence: true
  validates :title, length: { minimum: 5, maximum: 64 }, allow_blank: true
  validates :contact_email, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_blank: true
  validates :organization_name, length: { maximum: 150 }
  validates :contact_name, length: { maximum: 100 }
  validates :contact_email, length: { maximum: 150 }
  validate :service_date_within_school_year
  validate :photos_are_valid_type

  # Scopes
  scope :recent, -> { order(created_at: :desc) }
  scope :by_date_range, ->(start_date, end_date) { where(service_date: start_date..end_date) }
  scope :on_campus, -> { where(on_campus: true) }
  # Excludes hours logged under community restitution categories from totals
  scope :non_restitution, -> { joins(:category).where(categories: { restitution: false }) }

  private

  # Returns the start and end dates for the current academic school year.
  # School year runs September 1 – June 30 of the following calendar year.
  def current_school_year
    today = Date.current
    year_start = today.month >= 9 ? Date.new(today.year, 9, 1) : Date.new(today.year - 1, 9, 1)
    year_end = year_start + 1.year - 1.day # August 31
    # Clamp visible end to June 30 (end of academic portion)
    academic_end = Date.new(year_start.year + 1, 6, 30)
    [ year_start, academic_end ]
  end

  def service_date_within_school_year
    return unless service_date.present?

    year_start, year_end = current_school_year
    if service_date < year_start
      errors.add(:service_date, "must be on or after the school year start (#{year_start.strftime('%b %-d, %Y')})")
    elsif service_date > year_end
      errors.add(:service_date, "must be within the current school year (before #{year_end.strftime('%b %-d, %Y')})")
    end
  end

  ALLOWED_PHOTO_CONTENT_TYPES = %w[
    image/jpeg image/png image/gif image/webp image/jpg
    video/mp4 video/mpeg video/quicktime video/webm
    application/pdf
  ].freeze

  def photos_are_valid_type
    photos.each do |photo|
      next if photo.content_type.in?(ALLOWED_PHOTO_CONTENT_TYPES)

      errors.add(:photos, "must be an image, video, or PDF (#{photo.filename} is #{photo.content_type})")
    end
  end
end
