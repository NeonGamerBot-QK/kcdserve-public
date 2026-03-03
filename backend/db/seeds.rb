# frozen_string_literal: true

# Seed data for KCDServe community service platform
# Run with: bin/rails db:seed

puts "Seeding database..."

# Create categories
categories = [
  { name: "Environmental", description: "Environmental cleanup and conservation", color: "#28a745" },
  { name: "Education", description: "Tutoring, mentoring, and educational programs", color: "#007bff" },
  { name: "Healthcare", description: "Health fairs, blood drives, and wellness events", color: "#dc3545" },
  { name: "Community Building", description: "Neighborhood events and civic engagement", color: "#ffc107" },
  { name: "Food Service", description: "Food banks, meal prep, and distribution", color: "#fd7e14" },
  { name: "Animal Welfare", description: "Animal shelter volunteering and rescue", color: "#6f42c1" },
  { name: "Disaster Relief", description: "Emergency response and disaster recovery", color: "#e83e8c" },
  { name: "Arts & Culture", description: "Cultural events, arts programs, and museums", color: "#20c997" },
  { name: "Community Service", description: "General community service and volunteer work", color: "#17a2b8" }
].map { |attrs| Category.find_or_create_by!(name: attrs[:name]) { |c| c.assign_attributes(attrs) } }

puts "  Created #{categories.size} categories"

# Create super admin account
super_admin = User.find_or_create_by!(email: "admin@kcdserve.com") do |u|
  u.first_name = "Super"
  u.last_name = "Admin"
  u.password = ENV["SEED_PASSWORD"] || "password123"
  u.password_confirmation = ENV["SEED_PASSWORD"] || "password123"
  u.role = :super_admin
end

puts "  Created super admin: admin@kcdserve.com / password123"

# Create neon super admin
neon = User.find_or_create_by!(email: "neon@saahild.com") do |u|
  u.first_name = "Neon"
  u.last_name = "User"
  u.password = ENV["SEED_PASSWORD"] || "password123"
  u.password_confirmation = ENV["SEED_PASSWORD"] || "password123"
  u.role = :super_admin
end

puts "  Created super admin: neon@saahild.com / password123"

# Create sample admin
admin = User.find_or_create_by!(email: "admin2@kcdserve.com") do |u|
  u.first_name = "Site"
  u.last_name = "Admin"
  u.password = ENV["SEED_PASSWORD"] || "password123"
  u.password_confirmation = ENV["SEED_PASSWORD"] || "password123"
  u.role = :admin
end

puts "  Created admin: admin2@kcdserve.com / password123"

# Create sample volunteers
volunteers = 5.times.map do |i|
  User.find_or_create_by!(email: "volunteer#{i + 1}@kcdserve.com") do |u|
    u.first_name = [ "Alice", "Bob", "Carol", "David", "Emma" ][i]
    u.last_name = [ "Johnson", "Smith", "Williams", "Brown", "Davis" ][i]
    u.password = ENV["SEED_PASSWORD"] || "password123"
    u.password_confirmation = ENV["SEED_PASSWORD"] || "password123"
    u.role = :volunteer
    u.bio = "Passionate volunteer committed to making a difference."
  end
end

puts "  Created super admin: admin@kcdserve.com / password123"

# Create neon super admin
neon = User.find_or_create_by!(email: "neon@saahild.com") do |u|
  u.first_name = "Neon"
  u.last_name = "User"
  u.password = "password123"
  u.role = :super_admin
end

puts "  Created super admin: neon@saahild.com / password123"

# Create sample admin
admin = User.find_or_create_by!(email: "admin2@kcdserve.com") do |u|
  u.first_name = "Site"
  u.last_name = "Admin"
  u.password = "password123"
  u.role = :admin
end

puts "  Created admin: admin2@kcdserve.com / password123"

# Create sample volunteers
volunteers = 5.times.map do |i|
  User.find_or_create_by!(email: "volunteer#{i + 1}@kcdserve.com") do |u|
    u.first_name = [ "Alice", "Bob", "Carol", "David", "Emma" ][i]
    u.last_name = [ "Johnson", "Smith", "Williams", "Brown", "Davis" ][i]
    u.password = "password123"
    u.role = :volunteer
    u.bio = "Passionate volunteer committed to making a difference."
  end
end

puts "  Created #{volunteers.size} volunteers"

# Create groups
groups = [
  { name: "Youth Volunteers", description: "Young people making a difference in their community" },
  { name: "Corporate Partners", description: "Business professionals giving back" },
  { name: "Senior Helpers", description: "Experienced volunteers sharing their wisdom" }
].map do |attrs|
  Group.find_or_create_by!(name: attrs[:name]) do |g|
    g.description = attrs[:description]
    g.leader = admin
  end
end

puts "  Created #{groups.size} groups"

# Add volunteers to groups
volunteers.each_with_index do |v, i|
  group = groups[i % groups.size]
  GroupMembership.find_or_create_by!(user: v, group: group)
end

puts "  Added volunteers to groups"

# Create opportunities
opportunities = [
  { title: "Park Cleanup Day", description: "Help clean up Central Park and plant new trees.", date: Date.current + 7, location: "Central Park", required_hours: 4, max_volunteers: 25, published: true, category: categories[0] },
  { title: "After-School Tutoring", description: "Tutor students in math and reading at the community center.", date: Date.current + 14, location: "Community Center", required_hours: 2, max_volunteers: 10, published: true, category: categories[1] },
  { title: "Food Bank Distribution", description: "Sort and distribute food at the local food bank.", date: Date.current + 21, location: "City Food Bank", required_hours: 3, max_volunteers: 20, published: true, category: categories[4] },
  { title: "Animal Shelter Walkathon", description: "Walk shelter dogs and help with adoption events.", date: Date.current + 30, location: "Happy Tails Shelter", required_hours: 5, max_volunteers: 15, published: true, category: categories[5] }
].map do |attrs|
  cat = attrs.delete(:category)
  Opportunity.find_or_create_by!(title: attrs[:title]) do |o|
    o.assign_attributes(attrs)
    o.category = cat
    o.creator = super_admin
  end
end

puts "  Created #{opportunities.size} opportunities"

# Create sample service hours
volunteers.each do |volunteer|
  3.times do |i|
    ServiceHour.find_or_create_by!(
      user: volunteer,
      service_date: Date.current - (i * 7 + rand(1..5)),
      category: categories.sample
    ) do |sh|
      sh.hours = [ 1, 1.5, 2, 2.5, 3, 4 ].sample
      sh.description = "Volunteered at a local community event. Helped with setup, coordination, and cleanup."
      sh.status = [ :pending, :approved, :approved ].sample
      sh.group = volunteer.groups.first
    end
  end
end

puts "  Created sample service hours"
puts "Seeding complete!"
