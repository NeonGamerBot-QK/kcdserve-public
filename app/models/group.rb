class Group < ApplicationRecord
  # Associations
  belongs_to :leader, class_name: "User", optional: true
  has_many :group_memberships, dependent: :destroy
  has_many :members, through: :group_memberships, source: :user
  has_many :service_hours, dependent: :nullify

  # Active Storage
  has_one_attached :logo

  # Validations
  validates :name, presence: true, uniqueness: true

  # Returns total approved hours for all members in this group
  def total_approved_hours
    service_hours.approved.sum(:hours)
  end

  # Returns the count of active members in this group
  def member_count
    members.count
  end
end
