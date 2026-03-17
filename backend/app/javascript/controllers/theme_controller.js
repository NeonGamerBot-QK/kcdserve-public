import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["toggle"];

  connect() {
    this.updateToggle();
  }

  toggle() {
    if (localStorage.theme === "dark") {
      localStorage.theme = "light";
      document.documentElement.classList.remove("dark");
    } else {
      localStorage.theme = "dark";
      document.documentElement.classList.add("dark");
    }
    this.updateToggle();
  }

  updateToggle() {
    const isDark = document.documentElement.classList.contains("dark");
    this.toggleTarget.textContent = isDark ? "☀️ Light" : "🌙 Dark";
  }
}
