class User < ApplicationRecord
  has_paper_trail

  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  default_scope { where(deleted_at: nil) }
  scope :with_deleted, -> { unscope(where: :deleted_at) }
  scope :only_deleted, -> { unscope(where: :deleted_at).where.not(deleted_at: nil) }
  scope :deleted_over_7_years_ago, -> { only_deleted.where(deleted_at: ...7.years.ago) }

  if !Rails.env.development? && ENV["GOOGLE_CLIENT_ID"].present?
    devise :omniauthable, omniauth_providers: [ :google_oauth2 ]
  end

  def send_magic_link
    token = SecureRandom.urlsafe_base64(32)
    update!(magic_link_token: token, magic_link_sent_at: Time.current)
    MagicLinkMailer.magic_link(self, token).deliver_now
  end

  def magic_link_valid?
    magic_link_sent_at && magic_link_sent_at > 15.minutes.ago
  end

  # Roles enum: volunteer=0, group_leader=1, admin=2, super_admin=3, teacher=4
  enum :role, { volunteer: 0, group_leader: 1, admin: 2, super_admin: 3, teacher: 4 }

  # Associations
  has_many :group_memberships, dependent: :destroy
  has_many :groups, through: :group_memberships
  has_many :led_groups, class_name: "Group", foreign_key: :leader_id, dependent: :nullify, inverse_of: :leader
  has_many :service_hours, dependent: :restrict_with_error
  has_many :reviewed_hours, class_name: "ServiceHour", foreign_key: :reviewed_by_id, dependent: :nullify, inverse_of: :reviewer
  has_many :edited_hours, class_name: "ServiceHour", foreign_key: :edited_by_id, dependent: :nullify, inverse_of: :editor
  has_many :created_opportunities, class_name: "Opportunity", foreign_key: :created_by_id, dependent: :nullify, inverse_of: :creator
  has_many :sessions, dependent: :destroy
  has_many :opportunity_signups, dependent: :destroy
  has_many :signed_up_opportunities, through: :opportunity_signups, source: :opportunity

  # Active Storage
  has_one_attached :avatar

  # Validations
  validates :first_name, presence: true
  validates :last_name, presence: true

  # Returns the user's full display name
  def full_name
    "#{first_name} #{last_name}"
  end

  # Calculates the user's current age from their birthday
  def age
    return nil unless birthday

    today = Date.current
    age = today.year - birthday.year
    age -= 1 if today < birthday + age.years
    age
  end

  # Returns total approved service hours for the user, excluding community restitution hours
  def total_approved_hours
    service_hours.approved.non_restitution.sum(:hours)
  end

  # Checks if user has administrative privileges (admin or super_admin)
  def admin_or_above?
    admin? || super_admin?
  end

  # Checks if user has at least teacher-level access (teacher, admin, or super_admin)
  def staff?
    teacher? || admin_or_above?
  end

  # Finds or creates a user from OmniAuth provider data
  def self.from_omniauth(auth)
    where(provider: auth.provider, uid: auth.uid).first_or_create do |user|
      user.email = auth.info.email
      user.password = Devise.friendly_token[0, 20]
      user.first_name = auth.info.first_name || auth.info.name&.split(" ")&.first || "User"
      user.last_name = auth.info.last_name || auth.info.name&.split(" ")&.last || ""
    end
  end

  # Generates a 6-digit login PIN, stores it, and emails it to the user.
  # PIN expires after 10 minutes.
  def send_login_pin
    pin = SecureRandom.random_number(999_999).to_s.rjust(6, "0")
    update!(login_pin: pin, login_pin_sent_at: Time.current)
    LoginPinMailer.login_pin(self, pin).deliver_now
  end

  # Verifies the provided PIN matches and hasn't expired (10 minutes)
  def verify_login_pin(pin)
    return false if login_pin.blank? || login_pin_sent_at.blank?
    return false if login_pin_sent_at < 10.minutes.ago

    ActiveSupport::SecurityUtils.secure_compare(login_pin, pin)
  end

  # Clears the login PIN after successful verification
  def clear_login_pin!
    update!(login_pin: nil, login_pin_sent_at: nil)
  end

  # Returns true if the user has been soft-deleted
  def deleted?
    deleted_at.present?
  end

  # Soft-deletes the user by setting deleted_at timestamp
  def soft_delete!
    update!(deleted_at: Time.current)
  end

  # Restores a soft-deleted user by clearing deleted_at
  def restore!
    update!(deleted_at: nil)
  end
end
