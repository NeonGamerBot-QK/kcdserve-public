// Entry point for the importmap build
import "@hotwired/turbo-rails"
import "chartkick"
import "Chart.bundle"
import { Application } from "@hotwired/stimulus"
import { eagerLoadControllersFrom } from "@hotwired/stimulus-loading"

const application = Application.start()
eagerLoadControllersFrom("controllers", application)
