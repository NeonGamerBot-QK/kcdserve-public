class Category < ApplicationRecord
  has_many :opportunities, dependent: :nullify
  has_many :service_hours, dependent: :nullify

  validates :name, presence: true, uniqueness: true
end
