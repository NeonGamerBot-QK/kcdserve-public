# OmniAuth 2.x requires explicit CSRF protection configuration.
# Devise's button_to already sends the Rails authenticity_token,
# so we let Rails handle CSRF and disable OmniAuth's own check.
OmniAuth.config.allowed_request_methods = [ :post ]
OmniAuth.config.request_validation_phase = nil
