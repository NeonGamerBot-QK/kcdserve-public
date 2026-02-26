# KCDServe — Community Service Hour Logging Platform

A production-ready Ruby on Rails application for tracking volunteer service hours, managing opportunities, and generating service resumes. Built with Rails 8.1, PostgreSQL, Devise, Pundit, and Bootstrap 5.

## Features

- **User Roles** — Super Admin, Admin, Group Leader, Volunteer with full RBAC via Pundit
- **Service Hour Logging** — Submit, track, and review volunteer hours with photo proof
- **Volunteer Opportunities** — Public-facing sign-up system with capacity tracking
- **Groups** — Create and manage volunteer groups with dedicated tracking
- **Admin Dashboard** — Analytics, reporting, user management, and CSV exports
- **Service Resume** — Generate downloadable PDF resumes of verified service history
- **Google OAuth** — Social login via OmniAuth
- **Email Notifications** — Submission confirmations, review updates, and event reminders

## Tech Stack

- Ruby 3.4.3 / Rails 8.1
- PostgreSQL
- Devise + OmniAuth (Google OAuth2)
- Pundit (authorization)
- Bootstrap 5.3
- Chartkick + Groupdate (analytics)
- Prawn (PDF generation)
- Active Storage (file uploads)
- Solid Queue (background jobs)
- Pagy (pagination)

## Getting Started

### Prerequisites

- Ruby 3.4.3
- PostgreSQL
- Node.js (for importmap)

### Setup

```bash
# Install dependencies
bundle install

# Create and migrate database
bin/rails db:create db:migrate

# Seed sample data
bin/rails db:seed

# Start the server
bin/rails server
```

### Default Accounts (after seeding)

| Role        | Email                   | Password    |
| ----------- | ----------------------- | ----------- |
| Super Admin | admin@kcdserve.com      | password123 |
| Admin       | admin2@kcdserve.com     | password123 |
| Volunteer   | volunteer1@kcdserve.com | password123 |

### Google OAuth Setup

Set these environment variables:

```bash
export GOOGLE_CLIENT_ID="your-client-id"
export GOOGLE_CLIENT_SECRET="your-client-secret"
```

## Project Structure

```
app/
├── controllers/
│   ├── admin/          # Admin namespace controllers
│   ├── users/          # OmniAuth callbacks
│   ├── opportunities_controller.rb
│   ├── service_hours_controller.rb
│   ├── groups_controller.rb
│   ├── profiles_controller.rb
│   └── resumes_controller.rb
├── models/             # User, Group, Opportunity, ServiceHour, Category
├── policies/           # Pundit authorization policies
├── services/           # ResumeGeneratorService (PDF)
├── jobs/               # Background jobs (resume, reminders)
├── mailers/            # Email notifications
└── views/              # ERB templates with Bootstrap 5
```

## Testing

```bash
bin/rails test
```

## License

This project is proprietary.
