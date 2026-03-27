# Admins seed
admins_emails = [
  "neon@saahild.com",
  "saahil.dutta@student.kcd.org",
  "caden.wang@student.kcd.org",
  "parker.scinta@kcd.org",
  "tim.rice@student.kcd.org",
  "michael.goldberg@kcd.org"
]
index = 0
admins_emails.each do |email|
  User.find_or_create_by!(email: email) do |u|
    u.first_name = email.split("@").first.capitalize
    u.last_name = "Admin"
    u.password = Random.hex(16)
    u.role = :admin unless index <= 3
    u.role = :super_admin if index <= 3
    u.save!
    puts "Created admin user with email: #{email}"
    index += 1
  end
end


## Groups

labels = %w[Seniors Juniors Sophomores Freshmen]

senior_year = Date.current.month >= 9 ? Date.current.year + 1 : Date.current.year
labels.each_with_index do |label, i|
  year = senior_year + i
  Group.find_or_create_by!(name: "Class of #{year}") do |g|
    g.description = "Group of all students in #{year}."
    g.invite_only = true
    g.leader_id = User.find_by!(email: "parker.scinta@kcd.org").id
    g.save!
    puts "Created group: #{g.name}"
  end
end
Group.find_or_create_by!(name: "STEAM Certificate") do |g|
  g.description = "Group for students pursuing the STEAM Certificate."
  g.invite_only = true
  g.leader_id = User.find_by!(email: "tim.rice@student.kcd.org").id
  g.save!
end
Group.find_or_create_by!(name: "Honors") do |g|
  g.description = "Group for students in the Honors program."
  g.invite_only = true
  g.leader_id = User.find_by!(email: "michael.goldberg@kcd.org").id
  g.save!
end

## Categories
#  This is only for basic community service atm
categories = [
  "Animal Welfare",
  "Community Activism",
  "Community Event",
  { name: "Community Restitution (See Mr. Martin)", restitution: true },
  "Disaster Relief",
  "Education & Mentoring",
  "Elderly & Assisted Living",
  "Environment & Sustainability",
  "Equality & Social Justice",
  "Faith or Spiritual Organizations",
  "Food Security & Agriculture",
  "Health & Wellness",
  "KCD On-Campus Service (Limit: 4 hours)",
  "KCD Sponsored Event",
  "Leadership",
  "Poverty & Homelessness",
  "Summer Stretch (Limit: 4 hours)"
]

categories.each do |category|
  if category.is_a?(Hash)
    Category.find_or_create_by!(name: category[:name], restitution: category[:restitution])
  else
    Category.find_or_create_by!(name: category)
  end
end


## Events / Opportunities
opportunities = [
  { title: "Load the Lounge", location: "KCD Campus, Louisville, KY, 40207" },
  { title: "American Red Cross - Louisville", location: "510 E. Chestnut St., Louisville, KY, 40201",
    description: "The American Red Cross, through its strong network of volunteers, donors and partners, is always there in times of need." },
  { title: "Big Brothers Big Sisters - Louisville, KY", location: "1519 Gardiner Lane, Louisville, KY, 40218" },
  { title: "Boys and Girls Club", location: "3200 Greenwood Avenue, Louisville, KY, 40211" },
  { title: "Dare to Care Food Bank - Main", location: "5803 Fern Valley Rd., Louisville, KY, 40228",
    description: "To lead our community to feed the hungry and conquer the cycle of need." },
  { title: "Educational Justice", location: "737 S 3rd St, Louisville, KY, 40202",
    description: "Educational Justice strives to end educational inequity by pairing a 5th-8th grade student with a high-achieving high school student for long-term academic mentorship." },
  { title: "Kentucky Harvest Inc", location: "7705 NATIONAL TPKE, LOUISVILLE, KY, 40214-4803" },
  { title: "Kentucky Humane Society Lifelong Friends", location: "1000 Lyndon Lane, Louisville, KY, 40222",
    description: "The Kentucky Humane Society helps reduce the number of animals in shelters through education, spay/neuter services and adoptions." },
  { title: "Louisville Metro Parks and Recreation", location: "1297 Trevilian Way, Louisville, KY, 40213",
    description: "Metro Parks and Recreation services over 120 parks, 2 historic properties, 9 golf courses, 16 community centers, and more." },
  { title: "Salvation Army - Louisville, KY", location: "911 S. Brook Street, Louisville, KY, 40203" },
  { title: "Volunteers of America Mid-States: Freedom House", location: "1436 S. Shelby St., Louisville, KY, 40202",
    description: "Women's Addiction Recovery Program" },
  { title: "WaterStep", location: "625 Myrtle St., Louisville, KY, 40208" },
  { title: "West End School", location: "3628 Virginia Ave, Louisville, KY, 40211" }
]

opportunities.each_with_index do |attrs, index|
  Opportunity.find_or_create_by!(title: attrs[:title]) do |o|
    o.description = attrs[:description]
    o.location    = attrs[:location]
    o.date        = Date.current
    o.start_time  = Time.current
    o.end_time    = Time.current + 2.hours
    o.published   = true
    o.max_volunteers = 10 unless index % 2 == 0
    puts "Created opportunity: #{attrs[:title]}"
  end
end
