# frozen_string_literal: true

require "test_helper"

class CategoryTest < ActiveSupport::TestCase
  # -- Validations --

  test "is valid with valid attributes" do
    category = build(:category)
    assert category.valid?
  end

  test "is invalid without a name" do
    category = build(:category, name: nil)
    assert_not category.valid?
    assert_includes category.errors[:name], "can't be blank"
  end

  test "is invalid with a duplicate name" do
    create(:category, name: "Environment")
    duplicate = build(:category, name: "Environment")

    assert_not duplicate.valid?
    assert_includes duplicate.errors[:name], "has already been taken"
  end

  # -- Associations --

  test "has many opportunities" do
    category = create(:category)
    opportunity = create(:opportunity, category: category)
    assert_includes category.opportunities, opportunity
  end

  test "has many service_hours" do
    category = create(:category)
    service_hour = create(:service_hour, category: category)
    assert_includes category.service_hours, service_hour
  end

  test "nullifies opportunities on destroy" do
    category = create(:category)
    opportunity = create(:opportunity, category: category)

    category.destroy
    opportunity.reload
    assert_nil opportunity.category_id
  end

  test "nullifies service_hours on destroy" do
    category = create(:category)
    service_hour = create(:service_hour, category: category)

    category.destroy
    service_hour.reload
    assert_nil service_hour.category_id
  end
end
