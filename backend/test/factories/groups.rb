# frozen_string_literal: true

FactoryBot.define do
  factory :group do
    name { Faker::Team.unique.name }
    description { Faker::Lorem.sentence }
  end
end
