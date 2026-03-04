# frozen_string_literal: true

# Track create, update, and destroy events on all models with has_paper_trail
PaperTrail.config.enabled = true
PaperTrail.config.serializer = PaperTrail::Serializers::JSON
PaperTrail.config.has_paper_trail_defaults = {
  on: %i[create update destroy]
}
