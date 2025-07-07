import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import { createI18n } from "vue-i18n";
import router from "./router";
import messages from "./i18n/messages";
import { useThemeStore } from "./stores/themeStore";

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.use(
  createI18n({
    legacy: false, // Para usar Composition API
    locale: "es",
    messages,
  })
);

const themeStore = useThemeStore();
themeStore.applyTheme();

app.mount("#app");
