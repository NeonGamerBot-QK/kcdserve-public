# frozen_string_literal: true

FactoryBot.define do
  factory :opportunity do
    title { "Community Cleanup" }
    date { 1.week.from_now.to_date }
    description { "Help clean up the local park" }
  end
end
