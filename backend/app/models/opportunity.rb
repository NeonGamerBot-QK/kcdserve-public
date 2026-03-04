class Opportunity < ApplicationRecord
  has_paper_trail

  # Associations
  belongs_to :category, optional: true
  belongs_to :creator, class_name: "User", foreign_key: :created_by_id, optional: true
  has_many :opportunity_signups, dependent: :destroy
  has_many :volunteers, through: :opportunity_signups, source: :user
  has_many :service_hours, dependent: :nullify

  # Active Storage
  has_many_attached :photos

  # Validations
  validates :title, presence: true
  validates :date, presence: true

  # Scopes
  scope :published, -> { where(published: true) }
  scope :upcoming, -> { where("date >= ?", Date.current).order(:date) }
  scope :past, -> { where("date < ?", Date.current).order(date: :desc) }

  # Checks if the opportunity has reached its volunteer capacity
  def full?
    max_volunteers.present? && volunteers.count >= max_volunteers
  end

  # Returns the number of remaining volunteer spots
  def spots_remaining
    return nil unless max_volunteers.present?
    [max_volunteers - volunteers.count, 0].max
  end
end
