# frozen_string_literal: true

FactoryBot.define do
  factory :service_hour do
    user
    category
    hours { 2.0 }
    description { "Volunteered at the food bank" }
    service_date { Date.current }

    # Creates a service hour that has been approved
    trait :approved do
      status { :approved }
    end

    # Creates a service hour that has been rejected
    trait :rejected do
      status { :rejected }
    end
  end
end
