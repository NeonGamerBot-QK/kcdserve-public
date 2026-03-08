class Category < ApplicationRecord
  has_paper_trail

  has_many :opportunities, dependent: :nullify
  has_many :service_hours, dependent: :nullify

  validates :name, presence: true, uniqueness: true

  scope :restitution, -> { where(restitution: true) }
  scope :non_restitution, -> { where(restitution: false) }
end
