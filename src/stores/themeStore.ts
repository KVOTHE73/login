import { defineStore } from "pinia";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    theme: (localStorage.getItem("theme") as "light" | "dark") || "light",
  }),
  actions: {
    toggleTheme() {
      this.theme = this.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", this.theme);
      this.applyTheme();
    },
    applyTheme() {
      document.body.classList.remove("theme-light", "theme-dark");
      document.body.classList.add(`theme-${this.theme}`);
    },
  },
});
