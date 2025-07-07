<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useThemeStore } from "./stores/themeStore";

const themeStore = useThemeStore();

onMounted(() => {
  themeStore.applyTheme(); // Aplica el tema al cargar la app
});
</script>

<style>
html,
body,
#app {
  height: 100%;
  margin: 0;
  padding: 0;
}

/* Tema claro */
.theme-light {
  background-color: #f8f9fa;
  color: #212529;
}

/* Tema oscuro */
.theme-dark {
  background-color: #121212;
  color: #f8f9fa;
}
</style>
