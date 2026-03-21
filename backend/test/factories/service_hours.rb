# frozen_string_literal: true

FactoryBot.define do
  factory :service_hour do
    user
    category
    hours { 2.0 }
    sequence(:description) { |n| "Volunteered at the food bank session #{n}" }
    service_date { Date.current }
    on_campus { false }
    organization_name { nil }
    contact_name { nil }
    contact_email { nil }

    # Creates a service hour that has been approved
    trait :approved do
      status { :approved }
    end

    # Creates a service hour that has been rejected
    trait :rejected do
      status { :rejected }
    end

    # Creates a service hour performed on campus
    trait :on_campus do
      on_campus { true }
    end
  end
end
