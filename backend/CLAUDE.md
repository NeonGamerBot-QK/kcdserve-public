# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KCDServe is a Ruby on Rails 8.1 app for tracking volunteer service hours. Monolithic — ERB + Bootstrap 5 + Hotwire (Turbo + Stimulus) + importmap. No separate frontend build step.

All application code lives in `backend/`. Run all commands from that directory.

## Commands

```bash
bundle install
bin/rails db:create db:migrate
bin/rails db:seed

bin/rails server
bin/rails test
bin/rails test test/models/user_test.rb:42   # single test by line

bundle exec rubocop
bundle exec rubocop -a

# Dev-only routes (not rake tasks)
# POST /dev_login    — bypass auth
# POST /dev_promote  — promote user role
# GET  /flipper      — feature flag UI (admin+ in prod)
# GET  /mail         — letter_opener
```

## Architecture

### Error Handling Conventions

- **Validation failures**: use `redirect_with_errors(record, path)` (defined in `ApplicationController`) — sets `flash[:error]` and redirects. Never render 422s.
- **Auth failures**: `rescue_from Pundit::NotAuthorizedError` → `flash[:alert]` + redirect back.
- **Record not found**: `rescue_from ActiveRecord::RecordNotFound` → `flash[:alert]` + redirect back.
- `flash[:notice]` = green, `flash[:alert]` = red (auth/system), `flash[:error]` = red (validation). All three are rendered in both `layouts/application.html.erb` and `layouts/admin.html.erb`.
- Forms use `novalidate` to skip browser-native validation — always hits server.

### Authorization (Pundit)

Every controller action must call `authorize` or `policy_scope`. `ApplicationPolicy` denies everything by default. Admin namespace skips Pundit and uses role guards on `Admin::BaseController`:

- `require_staff!` — teacher, admin, super_admin
- `require_admin!` — admin, super_admin
- `require_super_admin!` — super_admin only

Tests that use `assert_raises(Pundit::NotAuthorizedError)` are broken by design — `rescue_from` catches it before it bubbles. Those tests are pre-existing failures; don't try to fix by removing `rescue_from`.

### User Roles

Enum on `User#role`: `volunteer=0`, `group_leader=1`, `admin=2`, `super_admin=3`, `teacher=4`

- `staff?` — teacher, admin, or super_admin
- `admin_or_above?` — admin or super_admin

Group creation requires `staff?`. Group update requires `admin_or_above? || leader`.

### Groups

- `invite_only: boolean` (default false) — private groups hidden from non-members in index/show, join blocked.
- `GroupPolicy::Scope` filters invite-only groups for non-staff via LEFT JOIN on `group_memberships`.
- Flipper UI mounted in prod behind `authenticate :user, ->(u) { u.admin_or_above? }`.

### Service Hours

`ServiceHour#status`: `pending=0`, `approved=1`, `rejected=2`.

Active validations (enforced server-side):
- `hours`: `> 0`, `<= 24`
- `title`: 5–64 chars, optional (allow_blank)
- `description`: required, 10–2000 chars
- `service_date`: must fall within current school year (Sep 1 – Jun 30)
- `photos`: content type must be image/video/PDF (custom validator `photos_are_valid_type`)

School year is computed dynamically in the model (`current_school_year` private method).

### Soft Deletion

`User` has `deleted_at` with `default_scope`. Use `User.with_deleted` / `User.only_deleted` to bypass. Associations that must survive deletion declare `-> { unscope(where: :deleted_at) }` in `belongs_to`.

### Layouts

- `layouts/application.html.erb` — public + volunteer views
- `layouts/admin.html.erb` — admin namespace; has `<%= yield :admin_css %>` in `<head>` for page-specific styles
- Both layouts render `flash[:notice]`, `flash[:alert]`, `flash[:error]`

### PDF / CSV

`ResumeGeneratorService` (Prawn) invoked via `ResumeGenerationJob`. Routes: `GET /resume/:id` and `GET /resume/:id/csv`.

### Audit Trail

PaperTrail on `User` and `ServiceHour`. Viewable at `/admin/audit_log`.

### Authentication

- Devise (email/password)
- Google OAuth — only when `GOOGLE_CLIENT_ID` set and not in development
- Magic links — 15-min expiry, `MagicLinkMailer`

### Email

Development uses letter_opener unless `SMTP_ADDRESS` is set. Mailers: `MagicLinkMailer`, `OpportunityMailer`, `ServiceHourMailer`.

### Testing

Factories in `test/factories/` (factory_bot + faker). Service hour factory uses `service_date: Date.current` — safe as long as school year validation passes for today's date. System tests use Capybara + Selenium.

Pre-existing test failures (do not regress further): ~19 failures across controllers, mostly `assert_raises(Pundit::NotAuthorizedError)` (broken by `rescue_from`) and index views checking description text that isn't rendered in the list.
