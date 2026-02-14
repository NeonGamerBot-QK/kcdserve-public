class OpportunitySignup < ApplicationRecord
  belongs_to :user
  belongs_to :opportunity

  validates :user_id, uniqueness: { scope: :opportunity_id, message: "has already signed up for this opportunity" }
end
