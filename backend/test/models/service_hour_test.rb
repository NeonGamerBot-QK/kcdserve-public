# frozen_string_literal: true

require "test_helper"

class ServiceHourTest < ActiveSupport::TestCase
  # -- Validations --

  test "is valid with valid attributes" do
    service_hour = build(:service_hour)
    assert service_hour.valid?
  end

  test "is invalid without hours" do
    service_hour = build(:service_hour, hours: nil)
    assert_not service_hour.valid?
    assert_includes service_hour.errors[:hours], "can't be blank"
  end

  test "is invalid with hours equal to zero" do
    service_hour = build(:service_hour, hours: 0)
    assert_not service_hour.valid?
    assert_includes service_hour.errors[:hours], "must be greater than 0"
  end

  test "is invalid with negative hours" do
    service_hour = build(:service_hour, hours: -1)
    assert_not service_hour.valid?
    assert_includes service_hour.errors[:hours], "must be greater than 0"
  end

  test "is invalid without a description" do
    service_hour = build(:service_hour, description: nil)
    assert_not service_hour.valid?
    assert_includes service_hour.errors[:description], "can't be blank"
  end

  test "is invalid without a service_date" do
    service_hour = build(:service_hour, service_date: nil)
    assert_not service_hour.valid?
    assert_includes service_hour.errors[:service_date], "can't be blank"
  end

  # -- Associations --

  test "belongs to a user" do
    service_hour = create(:service_hour)
    assert_instance_of User, service_hour.user
  end

  test "belongs to a category" do
    service_hour = create(:service_hour)
    assert_instance_of Category, service_hour.category
  end

  test "optionally belongs to an opportunity" do
    service_hour = build(:service_hour, opportunity: nil)
    assert service_hour.valid?
  end

  test "optionally belongs to a group" do
    service_hour = build(:service_hour, group: nil)
    assert service_hour.valid?
  end

  test "optionally belongs to a reviewer" do
    service_hour = build(:service_hour, reviewer: nil)
    assert service_hour.valid?
  end

  test "can be associated with a reviewer" do
    reviewer = create(:user, :admin)
    service_hour = create(:service_hour, :approved, reviewer: reviewer)
    assert_equal reviewer, service_hour.reviewer
  end

  test "has_many_attached photos" do
    service_hour = create(:service_hour)
    assert_respond_to service_hour, :photos
    assert_empty service_hour.photos
  end

  # -- Enum status --

  test "defaults to pending status" do
    service_hour = create(:service_hour)
    assert service_hour.pending?
  end

  test "can be approved" do
    service_hour = create(:service_hour, :approved)
    assert service_hour.approved?
  end

  test "can be rejected" do
    service_hour = create(:service_hour, :rejected)
    assert service_hour.rejected?
  end

  # -- Scopes --

  test ".recent orders by created_at descending" do
    category = create(:category)
    # Create with staggered timestamps to ensure deterministic ordering
    older = create(:service_hour, category: category)
    older.update_column(:created_at, 2.days.ago)
    newer = create(:service_hour, category: category)
    newer.update_column(:created_at, 1.day.ago)

    results = ServiceHour.recent
    assert_equal newer, results.first
    assert_equal older, results.second
  end

  test ".by_date_range filters service hours within the given date range" do
    category = create(:category)
    inside = create(:service_hour, category: category, service_date: Date.new(2026, 2, 15))
    _outside = create(:service_hour, category: category, service_date: Date.new(2026, 1, 1))

    results = ServiceHour.by_date_range(Date.new(2026, 2, 1), Date.new(2026, 2, 28))
    assert_includes results, inside
    assert_not_includes results, _outside
  end
end
