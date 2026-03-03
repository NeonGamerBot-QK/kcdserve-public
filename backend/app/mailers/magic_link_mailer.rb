class MagicLinkMailer < ApplicationMailer
  def magic_link(user, token)
    @user = user
    @magic_link_url = "#{Rails.application.routes.url_helpers.root_url}auth/magic_login?token=#{token}"
    mail(to: @user.email, subject: "Your Magic Login Link")
  end
end
