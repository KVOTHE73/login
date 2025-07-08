<!--
===================================================================================================================================================
🔷 Login
    💡 esta vista gestiona lo siguiente:
        🔶 Captura usuario y contraseña y lo valida contra el backend (simulado)
        🔶 Muestra el formulario centrado con diseño profesional y fondo degradado
        🔶 Permite seleccionar idioma con persistencia en localStorage
        🔶 Muestra un spinner de carga al enviar el formulario
        🔶 Informa claramente de los errores en cada input
===================================================================================================================================================
-->
<template>
  <div class="login">
    <!-- 🌐 Selector de idioma -->
    <div class="login-container">
      <div class="lang-theme-switch text-end mb-2">
        <button
          @click="setLang('es')"
          :aria-label="t('lang.es')"
          :aria-pressed="isLangEs"
          :title="t('lang.es')"
          :class="{ active: isLangEs }"
        >
          <img :src="flagEs" alt="Español" class="flag" />
        </button>
        <button
          @click="setLang('en')"
          :aria-label="t('lang.en')"
          :aria-pressed="isLangEn"
          :title="t('lang.en')"
          :class="{ active: isLangEn }"
        >
          <img :src="flagEn" alt="English" class="flag" />
        </button>

        <!-- 🌙 Cambio modo oscuro / claro -->
        <button
          type="button"
          class="theme-toggle-btn"
          :aria-label="themeStore.theme === 'dark' ? 'Light mode' : 'Dark mode'"
          :title="themeStore.theme === 'dark' ? 'Modo claro' : 'Modo oscuro'"
          @click="themeStore.toggleTheme"
        >
          {{ themeStore.theme === "light" ? "🌙" : "☀️" }}
        </button>
      </div>

      <!-- 🔹 Cabecera con logo, título y subtítulo -->
      <div class="login-header">
        <div class="brand">
          <span class="logo"></span>
          <div>
            <strong>NR2025</strong>
            <small>{{ t("login.subtitle") }}</small>
          </div>
        </div>
        <div class="icon">
          <i class="fa fa-lock"></i>
        </div>
      </div>

      <!-- 🔹 Formulario de login -->
      <div class="login-content">
        <form @submit.prevent="checkForm">
          <input
            v-model="username"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': usernameError }"
            :placeholder="t('login.user')"
            aria-required="true"
            @input="
              usernameError = null;
              error = null;
            "
          />
          <div v-if="usernameError" class="invalid-feedback">
            {{ usernameError }}
          </div>

          <input
            v-model="password"
            type="password"
            class="form-control"
            :class="{ 'is-invalid': passwordError }"
            :placeholder="t('login.password')"
            aria-required="true"
            @input="
              passwordError = null;
              error = null;
            "
          />
          <div v-if="passwordError" class="invalid-feedback">
            {{ passwordError }}
          </div>

          <div class="form-check mb-3">
            <input
              id="rememberMe"
              v-model="rememberMe"
              type="checkbox"
              class="form-check-input"
            />
            <label for="rememberMe" class="form-check-label">
              {{ t("login.remember") }}
            </label>
          </div>

          <button type="submit" class="btn btn-theme w-100" :disabled="loading">
            <span
              v-if="loading"
              class="spinner-border spinner-border-sm me-2"
            ></span>
            {{ t("login.signIn") }}
          </button>
        </form>

        <!-- 💡 Link olvidé contraseña -->
        <small class="d-block mt-2 text-center">
          <a href="#" @click.prevent="openResetModal">
            {{ t("login.forgotPassword") }}
          </a>
        </small>

        <!-- 💡 Mensaje de error general -->
        <div v-if="error" class="error-message" role="alert">
          {{ error }}
        </div>
      </div>
    </div>

    <!-- 💡 Modal recuperación -->
    <div v-if="showResetModal" class="reset-modal">
      <div class="reset-modal-content">
        <h5 class="mb-3">{{ t("login.resetTitle") }}</h5>
        <input
          v-model="resetEmail"
          type="email"
          :class="[
            'form-control mb-2',
            {
              'is-invalid':
                resetMessage && resetMessage !== t('login.resetSuccess'),
            },
          ]"
          :placeholder="t('login.resetPlaceholder')"
          aria-required="true"
          @input="onResetEmailInput"
        />
        <small
          id="resetHelp"
          class="form-text text-muted d-block mb-2 text-center"
        >
          {{ t("login.resetHelper") }}
        </small>
        <div class="d-flex justify-content-between mt-3">
          <button class="btn btn-secondary" @click="showResetModal = false">
            {{ t("login.cancel") }}
          </button>
          <button class="btn btn-theme" @click="submitReset">
            {{ t("login.sendReset") }}
          </button>
        </div>
        <div
          v-if="resetMessage"
          :class="[
            'mt-2',
            'text-center',
            resetMessage === t('login.resetSuccess')
              ? 'text-success'
              : 'text-danger',
          ]"
        >
          {{ resetMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ⛳ Imports
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import flagEs from "../assets/flags/es.png";
import flagEn from "../assets/flags/en.png";
import { createLogger } from "../composables/useLogger";
import { useThemeStore } from "../stores/themeStore";

// ⛳ Instancias
const logger = createLogger("@views/Login.vue");
const themeStore = useThemeStore();
const { t, locale } = useI18n();

// ⛳ Refs y estados reactivos
const username = ref("");
const password = ref("");
const rememberMe = ref(false);
const error = ref<string | null>(null);
const loading = ref(false);
const usernameError = ref<string | null>(null);
const passwordError = ref<string | null>(null);
const showResetModal = ref(false);
const resetEmail = ref("");
const resetMessage = ref("");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

// 🧮 Computeds
const isLangEs = computed(() => locale.value === "es");
const isLangEn = computed(() => locale.value === "en");

// 🔧 Handlers
function setLang(l: string) {
  locale.value = l;
  localStorage.setItem("lang", l);
}

const checkForm = async (): Promise<void> => {
  error.value = null;
  usernameError.value = null;
  passwordError.value = null;
  loading.value = true;

  // Validación de campos vacíos
  if (!username.value.trim()) {
    usernameError.value =
      t("login.userRequired") || "El usuario es obligatorio";
  }
  if (!password.value.trim()) {
    passwordError.value =
      t("login.passwordRequired") || "La contraseña es obligatoria";
  }
  if (usernameError.value || passwordError.value) {
    loading.value = false;
    return;
  }

  logger.log("checkForm => datos:", {
    usuario: username.value,
    contraseña: password.value,
    recordar: rememberMe.value,
  });

  await new Promise((r) => setTimeout(r, 1000));

  const users: Record<string, string> = {
    dashboard: "dash001",
    markdown: "mkd001",
    todolist: "todo001",
  } as const;

  const user = username.value.toLowerCase();
  const pass = password.value;

  if (!(user in users)) {
    usernameError.value = t("login.invalidUser") || "Usuario no válido";
    error.value = t("login.error") || "Usuario o contraseña incorrectos";
    loading.value = false;
    return;
  }

  if (pass !== users[user as keyof typeof users]) {
    passwordError.value = t("login.invalidPassword") || "Contraseña no válida";
    error.value = t("login.error") || "Usuario o contraseña incorrectos";
    loading.value = false;
    return;
  }

  loading.value = false;

  const url =
    user === "dashboard"
      ? "https://kvothe73.github.io/dashboard-startup"
      : user === "markdown"
      ? "https://kvothe73.github.io/live-markdown-editor"
      : "https://kvothe73.github.io/todo-list";

  window.open(url, "_blank");

  username.value = "";
  password.value = "";
  rememberMe.value = false;
};

const openResetModal = () => {
  resetEmail.value = "";
  resetMessage.value = "";
  showResetModal.value = true;
};

const submitReset = () => {
  if (!resetEmail.value) {
    resetMessage.value = t("login.resetError") || "Introduce un correo válido";
    return;
  }
  if (!emailRegex.test(resetEmail.value)) {
    resetMessage.value = t("login.resetError") || "Email inválido";
    return;
  }

  resetMessage.value =
    t("login.resetSuccess") || "Enlace de recuperación enviado";
  setTimeout(() => {
    resetMessage.value = "";
    showResetModal.value = false;
    resetEmail.value = "";
  }, 1500);
};

const onResetEmailInput = () => {
  if (resetMessage.value) resetMessage.value = "";
};

// 🔄 Ciclo de vida
onMounted(() => {
  themeStore.applyTheme();
  const storedLang = localStorage.getItem("lang");
  if (storedLang && (storedLang === "es" || storedLang === "en")) {
    locale.value = storedLang;
  }
});
</script>

<style scoped>
/* 
===============================================================================
🌍 ESTILO BANDERAS
===============================================================================
*/
.lang-theme-switch button {
  background: none;
  border: none;
  padding: 0;
  margin: 0 0.25rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.flag {
  width: 24px;
  height: 16px;
  border-radius: 2px;
  object-fit: cover;
  transition: filter 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  background-color: transparent;
}
.lang-theme-switch button:hover .flag {
  filter: brightness(90%);
}
.lang-theme-switch button.active .flag {
  box-shadow: 0 0 0 2px #00b4b6;
  transform: scale(1.05);
}
/* botón de cambio de tema */
.theme-toggle-btn {
  font-size: 1.2rem;
}
/* 
===============================================================================
🎨 ESTILO GENERAL LOGIN
===============================================================================
*/
.login {
  min-height: 100vh;
  background: linear-gradient(to bottom, #6c757d 0%, #212529 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1rem;
  transition: background 0.3s ease-in-out;
}
.login-container {
  padding: 2rem;
  border-radius: 8px;
  width: 100%;
  max-width: 380px;
  color: #fff;
}
.login-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.brand .logo {
  width: 30px;
  height: 30px;
  background: linear-gradient(135deg, #00b4b6 50%, #00979a 50%);
  position: relative;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}
.brand .logo::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(225deg, #00c4c6 50%, #008587 50%);
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
  opacity: 0.5;
}
.brand strong {
  font-size: 1.2rem;
}
.brand small {
  display: block;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}
.icon i {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.6);
}

/* 
===============================================================================
🎨 FORMULARIO
===============================================================================
*/
.form-control {
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.form-control:focus {
  border-color: #00b4b6;
  box-shadow: 0 0 0 3px rgba(0, 180, 182, 0.25);
  outline: none;
}
.is-invalid {
  border-color: #ff6b6b;
}
.invalid-feedback {
  color: #ff6b6b;
  font-size: 0.8rem;
  margin-top: -0.25rem;
  margin-bottom: 0.5rem;
}
.btn-theme {
  background: linear-gradient(135deg, #00b4b6, #00979a);
  color: #fff;
  border: none;
  padding: 0.75rem;
  font-weight: bold;
  border-radius: 4px;
  transition: background 0.2s ease, transform 0.2s ease;
}
.btn-theme:hover {
  background: linear-gradient(135deg, #009fa1, #007f81);
  transform: translateY(-2px);
}
.error-message {
  color: #ff6b6b;
  font-weight: bold;
  margin-top: 0.5rem;
  text-align: center;
}

/* 
===============================================================================
💬 MODAL RECUPERAR CONTRASEÑA
===============================================================================
*/
.reset-modal {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}
.reset-modal-content {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  width: 100%;
  max-width: 350px;
  color: #212529;
}

/* 
===============================================================================
🌗 MODO CLARO / OSCURO: fondo general del login
===============================================================================
*/

/* Fondo en modo claro (degradado gris actual) */
body.theme-light .login {
  background: linear-gradient(to bottom, #6c757d 0%, #212529 100%);
}

/* Fondo en modo oscuro (negro puro) */
body.theme-dark .login {
  background: #000;
}

/* Inputs en modo oscuro */
body.theme-dark .form-control {
  background-color: #2c2c2c;
  color: #fff;
  border-color: #444;
}
body.theme-dark .form-control::placeholder {
  color: #aaa;
}
body.theme-dark .form-control:focus {
  border-color: #00b4b6;
  box-shadow: 0 0 0 3px rgba(0, 180, 182, 0.25);
}
</style>
