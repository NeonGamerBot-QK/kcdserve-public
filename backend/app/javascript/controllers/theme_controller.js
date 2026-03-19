import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["toggle"];

  connect() {
    this.#updateLabel();
  }

  toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    this.#updateLabel();
  }

  #updateLabel() {
    const isDark = document.documentElement.classList.contains("dark");
    this.toggleTarget.textContent = isDark ? "☀️ Light" : "🌙 Dark";
  }
}
