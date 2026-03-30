import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "step",
    "indicator",
    "connectorLine",
    "backBtn",
    "nextBtn",
    "submitBtn",
    "stepTitle",
    "hoursInput",
    "photosInput",
    "photoRequiredLabel",
    "errorBox",
    "errorList",
  ]

  connect() {
    this.current = 0
    this.render()
  }

  next() {
    if (!this.validate()) return
    this.current++
    this.render()
    this.element.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  back() {
    this.current--
    this.render()
    this.element.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  render() {
    const total = this.stepTargets.length

    // Show only the current step
    this.stepTargets.forEach((step, i) => {
      step.classList.toggle("hidden", i !== this.current)
    })

    // Update step indicator circles
    this.indicatorTargets.forEach((el, i) => {
      const done = i < this.current
      const active = i === this.current

      el.classList.toggle("bg-primary-500", active || done)
      el.classList.toggle("text-white", active || done)
      el.classList.toggle("border-primary-500", active || done)
      el.classList.toggle("bg-white", !active && !done)
      el.classList.toggle("dark:bg-slate-800", !active && !done)
      el.classList.toggle("text-slate-400", !active && !done)
      el.classList.toggle("border-slate-300", !active && !done)
      el.classList.toggle("dark:border-slate-600", !active && !done)
    })

    // Animate connector line between steps
    if (this.hasConnectorLineTarget) {
      this.connectorLineTarget.classList.toggle("bg-primary-500", this.current >= 1)
      this.connectorLineTarget.classList.toggle("bg-slate-200", this.current < 1)
      this.connectorLineTarget.classList.toggle("dark:bg-slate-700", this.current < 1)
    }

    // Navigation buttons
    this.backBtnTarget.classList.toggle("hidden", this.current === 0)
    this.nextBtnTarget.classList.toggle("hidden", this.current === total - 1)
    this.submitBtnTarget.classList.toggle("hidden", this.current !== total - 1)

    // Step title + counter
    const titles = ["Service Details", "Supervisor & Proof"]
    if (this.hasStepTitleTarget) {
      this.stepTitleTarget.textContent = titles[this.current] ?? ""
    }
    // Update the "Step X of Y" counter rendered in the header
    const counterEl = this.element.querySelector("[data-step-counter]")
    if (counterEl) counterEl.textContent = this.current + 1

    this.clearErrors()
  }

  // Called when hours input changes — update the photo requirement label.
  hoursChanged() {
    if (!this.hasPhotoRequiredLabelTarget) return
    const hours = parseFloat(this.hoursInputTarget.value) || 0
    const required = hours >= 10
    this.photoRequiredLabelTarget.textContent = required ? "(required)" : "(optional)"
    this.photoRequiredLabelTarget.className = required
      ? "font-normal text-red-500 ml-1"
      : "font-normal text-slate-400 dark:text-slate-500 ml-1"
  }

  // Intercept form submit to enforce the photo requirement client-side.
  beforeSubmit(event) {
    this.clearErrors()
    const hours = parseFloat(this.hoursInputTarget.value) || 0
    const hasPhotos = this.photosInputTarget.files && this.photosInputTarget.files.length > 0
    if (hours >= 10 && !hasPhotos) {
      event.preventDefault()
      this.showErrors(["A photo is required when logging 10 or more hours."])
    }
  }

  // --- Validation ---

  validate() {
    this.clearErrors()
    if (this.current === 0) return this.validateStep1()
    return true
  }

  validateStep1() {
    const panel = this.stepTargets[0]
    const errors = []

    const dateEl = panel.querySelector('[name="service_hour[service_date]"]')
    const hoursEl = panel.querySelector('[name="service_hour[hours]"]')
    const catEl = panel.querySelector('[name="service_hour[category_id]"]')
    const descEl = panel.querySelector('[name="service_hour[description]"]')

    if (!dateEl.value) {
      errors.push("Date of service is required.")
      this.markInvalid(dateEl)
    }

    if (!hoursEl.value || parseFloat(hoursEl.value) <= 0) {
      errors.push("Hours must be greater than 0.")
      this.markInvalid(hoursEl)
    }

    if (!catEl.value) {
      errors.push("Category is required.")
      this.markInvalid(catEl)
    }

    if (!descEl.value || descEl.value.trim().length < 10) {
      errors.push("Description must be at least 10 characters.")
      this.markInvalid(descEl)
    }

    if (errors.length > 0) {
      this.showErrors(errors)
      return false
    }
    return true
  }

  markInvalid(el) {
    el.classList.add("border-red-500", "focus:ring-red-500")
    el.addEventListener("input", () => {
      el.classList.remove("border-red-500", "focus:ring-red-500")
    }, { once: true })
  }

  showErrors(errors) {
    this.errorBoxTarget.classList.remove("hidden")
    this.errorListTarget.innerHTML = errors.map(e => `<li>${e}</li>`).join("")
    this.errorBoxTarget.scrollIntoView({ behavior: "smooth", block: "nearest" })
  }

  clearErrors() {
    this.errorBoxTarget.classList.add("hidden")
    this.errorListTarget.innerHTML = ""
  }
}
