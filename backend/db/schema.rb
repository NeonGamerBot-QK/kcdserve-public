# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_03_04_020000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.bigint "record_id", null: false
    t.string "record_type", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.string "content_type"
    t.datetime "created_at", null: false
    t.string "filename", null: false
    t.string "key", null: false
    t.text "metadata"
    t.string "service_name", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "categories", force: :cascade do |t|
    t.string "color", default: "#6c757d"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["name"], name: "index_categories_on_name", unique: true
  end

  create_table "flipper_features", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "key", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_flipper_features_on_key", unique: true
  end

  create_table "flipper_gates", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "feature_key", null: false
    t.string "key", null: false
    t.datetime "updated_at", null: false
    t.text "value"
    t.index ["feature_key", "key", "value"], name: "index_flipper_gates_on_feature_key_and_key_and_value", unique: true
  end

  create_table "group_memberships", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "group_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["group_id"], name: "index_group_memberships_on_group_id"
    t.index ["user_id", "group_id"], name: "index_group_memberships_on_user_id_and_group_id", unique: true
    t.index ["user_id"], name: "index_group_memberships_on_user_id"
  end

  create_table "groups", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.bigint "leader_id"
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["leader_id"], name: "index_groups_on_leader_id"
    t.index ["name"], name: "index_groups_on_name", unique: true
  end

  create_table "opportunities", force: :cascade do |t|
    t.bigint "category_id"
    t.datetime "created_at", null: false
    t.bigint "created_by_id"
    t.date "date", null: false
    t.text "description"
    t.time "end_time"
    t.string "location"
    t.integer "max_volunteers"
    t.boolean "published", default: false
    t.decimal "required_hours", precision: 6, scale: 2
    t.time "start_time"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_opportunities_on_category_id"
    t.index ["created_by_id"], name: "index_opportunities_on_created_by_id"
    t.index ["date"], name: "index_opportunities_on_date"
    t.index ["published"], name: "index_opportunities_on_published"
  end

  create_table "opportunity_signups", force: :cascade do |t|
    t.boolean "attended", default: false
    t.datetime "created_at", null: false
    t.bigint "opportunity_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["opportunity_id"], name: "index_opportunity_signups_on_opportunity_id"
    t.index ["user_id", "opportunity_id"], name: "index_opportunity_signups_on_user_id_and_opportunity_id", unique: true
    t.index ["user_id"], name: "index_opportunity_signups_on_user_id"
  end

  create_table "service_hours", force: :cascade do |t|
    t.text "admin_comment"
    t.bigint "category_id"
    t.string "contact_email"
    t.string "contact_name"
    t.datetime "created_at", null: false
    t.text "description", null: false
    t.datetime "edited_at"
    t.bigint "edited_by_id"
    t.bigint "group_id"
    t.decimal "hours", precision: 6, scale: 2, null: false
    t.boolean "on_campus", default: false, null: false
    t.bigint "opportunity_id"
    t.string "organization_name"
    t.datetime "reviewed_at"
    t.bigint "reviewed_by_id"
    t.date "service_date", null: false
    t.integer "status", default: 0, null: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["category_id"], name: "index_service_hours_on_category_id"
    t.index ["edited_by_id"], name: "index_service_hours_on_edited_by_id"
    t.index ["group_id"], name: "index_service_hours_on_group_id"
    t.index ["opportunity_id"], name: "index_service_hours_on_opportunity_id"
    t.index ["reviewed_by_id"], name: "index_service_hours_on_reviewed_by_id"
    t.index ["service_date"], name: "index_service_hours_on_service_date"
    t.index ["status"], name: "index_service_hours_on_status"
    t.index ["user_id"], name: "index_service_hours_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.text "bio"
    t.date "birthday"
    t.datetime "created_at", null: false
    t.datetime "deleted_at"
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "first_name", null: false
    t.string "last_name", null: false
    t.datetime "magic_link_sent_at"
    t.string "magic_link_token"
    t.string "phone"
    t.string "provider"
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "role", default: 0, null: false
    t.string "uid"
    t.datetime "updated_at", null: false
    t.index ["deleted_at"], name: "index_users_on_deleted_at"
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["provider", "uid"], name: "index_users_on_provider_and_uid", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["role"], name: "index_users_on_role"
  end

  create_table "versions", force: :cascade do |t|
    t.datetime "created_at"
    t.string "event", null: false
    t.bigint "item_id", null: false
    t.string "item_type", null: false
    t.text "object"
    t.text "object_changes"
    t.string "whodunnit"
    t.index ["item_type", "item_id"], name: "index_versions_on_item_type_and_item_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "group_memberships", "groups"
  add_foreign_key "group_memberships", "users"
  add_foreign_key "groups", "users", column: "leader_id"
  add_foreign_key "opportunities", "categories"
  add_foreign_key "opportunities", "users", column: "created_by_id"
  add_foreign_key "opportunity_signups", "opportunities"
  add_foreign_key "opportunity_signups", "users"
  add_foreign_key "service_hours", "categories"
  add_foreign_key "service_hours", "groups"
  add_foreign_key "service_hours", "opportunities"
  add_foreign_key "service_hours", "users"
  add_foreign_key "service_hours", "users", column: "edited_by_id"
  add_foreign_key "service_hours", "users", column: "reviewed_by_id"
end
