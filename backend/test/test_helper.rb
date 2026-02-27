ENV["RAILS_ENV"] ||= "test"
require_relative "../config/environment"
require "rails/test_help"

module ActiveSupport
  class TestCase
    include FactoryBot::Syntax::Methods

    parallelize(workers: :number_of_processors)

    # Don't load fixtures since we use FactoryBot
  end
end

# Include Devise test helpers in controller and integration tests
class ActionDispatch::IntegrationTest
  include Devise::Test::IntegrationHelpers
end
