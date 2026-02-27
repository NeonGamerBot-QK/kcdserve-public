# frozen_string_literal: true

FactoryBot.define do
  factory :opportunity_signup do
    user
    opportunity
  end
end
