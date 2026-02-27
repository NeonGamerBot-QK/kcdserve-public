# frozen_string_literal: true

FactoryBot.define do
  factory :user do
    first_name { "Jane" }
    last_name { "Doe" }
    sequence(:email) { |n| "user#{n}@example.com" }
    password { "password123" }

    # Creates a user with the admin role
    trait :admin do
      role { :admin }
    end

    # Creates a user with the super_admin role
    trait :super_admin do
      role { :super_admin }
    end

    # Creates a user with the group_leader role
    trait :group_leader do
      role { :group_leader }
    end
  end
end
