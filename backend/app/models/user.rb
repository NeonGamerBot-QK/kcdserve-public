class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

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

  # Roles enum: volunteer=0, group_leader=1, admin=2, super_admin=3
  enum :role, { volunteer: 0, group_leader: 1, admin: 2, super_admin: 3 }

  # Associations
  has_many :group_memberships, dependent: :destroy
  has_many :groups, through: :group_memberships
  has_many :led_groups, class_name: "Group", foreign_key: :leader_id, dependent: :nullify, inverse_of: :leader
  has_many :service_hours, dependent: :destroy
  has_many :reviewed_hours, class_name: "ServiceHour", foreign_key: :reviewed_by_id, dependent: :nullify, inverse_of: :reviewer
  has_many :created_opportunities, class_name: "Opportunity", foreign_key: :created_by_id, dependent: :nullify, inverse_of: :creator
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

  # Returns total approved service hours for the user
  def total_approved_hours
    service_hours.approved.sum(:hours)
  end

  # Checks if user has administrative privileges (admin or super_admin)
  def admin_or_above?
    admin? || super_admin?
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
end
