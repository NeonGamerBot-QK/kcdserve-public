class MagicLinkMailer < ApplicationMailer
  def magic_link(user, token)
    @user = user
    @magic_link_url = auth_magic_login_url(token: token)
    mail(to: @user.email, subject: "Your Magic Login Link")
  end
end
