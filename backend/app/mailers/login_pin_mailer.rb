# frozen_string_literal: true

class LoginPinMailer < ApplicationMailer
  def login_pin(user, pin)
    @user = user
    @pin = pin
    mail(to: @user.email, subject: "Your KCDServe Login Code: #{@pin}")
  end
end
