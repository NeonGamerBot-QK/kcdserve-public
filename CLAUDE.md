# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KCDServe is a Ruby on Rails 8.1 application for tracking volunteer service hours. It is a **monolithic Rails app** with no separate frontend framework — ERB templates with Bootstrap 5, Hotwire (Turbo + Stimulus), and importmap.

All application code lives in `backend/`. Run all commands from that directory.

## Commands

```bash
# Install dependencies
bundle install

# Database
bin/rails db:create db:migrate
bin/rails db:seed           # Seeds default accounts (see README)

# Development server
bin/rails server

# Run all tests
bin/rails test

# Run a single test file
bin/rails test test/models/user_test.rb

# Run a single test by line number
bin/rails test test/models/user_test.rb:42

# Linting
bundle exec rubocop
bundle exec rubocop -a     # Auto-correct

# Security audits
bundle exec brakeman
bundle exec bundler-audit

# Background jobs (Solid Queue)
bin/rails solid_queue:start

# Dev-only utilities (available at runtime, not rake tasks)
# POST /dev_login    — bypass auth in development
# POST /dev_promote  — promote user role in development
# GET  /flipper      — feature flag UI
# GET  /mail         — letter_opener email viewer
```

## Architecture

### Authorization (Pundit)

Every controller action should call `authorize` (or `policy_scope`). `ApplicationPolicy` denies all actions by default — subclass and explicitly permit. The admin namespace uses role-based guards instead of Pundit policies:

- `Admin::BaseController#require_staff!` — teacher, admin, or super_admin
- `Admin::BaseController#require_admin!` — admin or super_admin only
- `Admin::BaseController#require_super_admin!` — super_admin only

### User Roles

`User#role` is an enum: `volunteer=0`, `group_leader=1`, `admin=2`, `super_admin=3`, `teacher=4`

Key helpers on `User`:
- `admin_or_above?` — admin or super_admin
- `staff?` — teacher, admin, or super_admin

### Soft Deletion

Users are soft-deleted via `deleted_at`. `User` has a `default_scope` filtering them out. Use `User.with_deleted` or `User.only_deleted` to bypass. Associations that must survive user deletion (e.g. `ServiceHour#user`) use `-> { unscope(where: :deleted_at) }` in their `belongs_to`.

### Service Hours

`ServiceHour#status` is an enum: `pending=0`, `approved=1`, `rejected=2`. Hours must belong to a `Category`. Optional associations: `Opportunity`, `Group`. Photos attached via Active Storage (`has_many_attached :photos`).

### PDF Generation

`ResumeGeneratorService` in `app/services/` produces a Prawn PDF. It is invoked asynchronously via `ResumeGenerationJob`. The `resumes#show` and `resumes#export_csv` routes handle delivery.

### Audit Trail

`PaperTrail` is enabled on `User` and `ServiceHour`. Versions are stored in the `versions` table and viewable at `admin/audit_log`.

### Feature Flags

Uses `flipper` + `flipper-active_record`. Flags are managed via the `/flipper` UI (development only).

### Authentication

- Primary: Devise (email/password)
- Google OAuth (OmniAuth) — only enabled when `GOOGLE_CLIENT_ID` is set and not in development
- Magic links — 15-minute expiry tokens sent via `MagicLinkMailer`

### Email

- Development: letter_opener (or SMTP if `SMTP_ADDRESS` env var is set)
- Mailers: `MagicLinkMailer`, `OpportunityMailer`, `ServiceHourMailer`

### Required Environment Variables

| Variable | Purpose |
|---|---|
| `GOOGLE_CLIENT_ID` | Google OAuth (optional) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth (optional) |
| `SMTP_ADDRESS` | SMTP delivery (optional, falls back to letter_opener) |

### Testing

Test factories are in `test/factories/` using `factory_bot_rails` + `faker`. Fixtures also exist in `test/fixtures/`. System tests use Capybara + Selenium.
