// =============================================================================
// 🔷 TESTS DE Login.vue
//    💡 Este archivo cubre todos los comportamientos esperados de la vista Login
//       🔹 Renderizado del formulario
//       🔹 Validaciones y errores
//       🔹 Cambios de idioma y tema
//       🔹 Flujo de login correcto con redirección
//       🔹 Modal de recuperación de contraseña
// =============================================================================

import { render, screen, fireEvent, waitFor } from "@testing-library/vue";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import { useThemeStore } from "../stores/themeStore";
import { createI18n } from "vue-i18n";
import messages from "../i18n/messages";
import Login from "@/views/Login.vue";

// ⛳ Configuración de i18n
const i18n = createI18n({
  legacy: false,
  locale: "es",
  messages,
});

// 📁 Agrupación de tests
describe("Login.vue", () => {
  // 🔧 Reset antes de cada test
  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    document.body.className = "";
  });

  // ⚙️ Función auxiliar para montar el componente
  const customRender = () =>
    render(Login, {
      global: {
        plugins: [
          createTestingPinia({
            stubActions: false,
            createSpy: vi.fn,
          }),
          i18n,
        ],
      },
    });

  // 📌 Test: Renderizado del formulario
  test("renderiza campos y botón correctamente", () => {
    customRender();

    expect(screen.getByPlaceholderText("Usuario")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Acceder" })).toBeInTheDocument();
  });

  // 📌 Test: Cambio de tema
  test("cambia el tema al pulsar el botón de modo oscuro / claro", async () => {
    const { container } = render(Login, {
      global: {
        plugins: [createTestingPinia({ stubActions: false }), i18n],
      },
    });

    const themeStore = useThemeStore();
    const spy = vi.spyOn(themeStore, "toggleTheme");

    const toggleBtn = container.querySelector(
      ".theme-toggle-btn"
    ) as HTMLButtonElement;
    expect(toggleBtn).toBeTruthy();

    await fireEvent.click(toggleBtn);
    expect(spy).toHaveBeenCalled();
  });

  // 📌 Test: Cambio de idioma
  test("cambia el idioma al pulsar el botón de idioma", async () => {
    const originalLocale = i18n.global.locale.value;

    const { getByPlaceholderText, getByTitle } = render(Login, {
      global: {
        plugins: [createTestingPinia({ stubActions: false }), i18n],
      },
    });

    expect(getByPlaceholderText("Usuario")).toBeInTheDocument();

    const enButton = getByTitle("Inglés");
    await fireEvent.click(enButton);

    expect(getByPlaceholderText("User")).toBeInTheDocument();

    // 🔁 Restauramos el idioma tras la prueba
    i18n.global.locale.value = originalLocale;
  });

  // 📌 Test: Validación de campos vacíos
  test("valida usuario y contraseña vacíos", async () => {
    customRender();

    await fireEvent.click(screen.getByRole("button", { name: "Acceder" }));

    expect(
      await screen.findByText("El usuario es obligatorio")
    ).toBeInTheDocument();
    expect(
      await screen.findByText("La contraseña es obligatoria")
    ).toBeInTheDocument();
  });

  // 📌 Test: Usuario inexistente
  test("muestra error si el usuario no existe", async () => {
    customRender();

    await fireEvent.update(
      screen.getByPlaceholderText("Usuario"),
      "inexistente"
    );
    await fireEvent.update(screen.getByPlaceholderText("Contraseña"), "1234");
    await fireEvent.click(screen.getByRole("button", { name: "Acceder" }));

    expect(await screen.findByText("Usuario incorrecto")).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Se ha producido un error en la validación de los datos introducidos"
      )
    ).toBeInTheDocument();
  });

  // 📌 Test: Contraseña incorrecta
  test("muestra error si la contraseña es incorrecta", async () => {
    customRender();

    await fireEvent.update(screen.getByPlaceholderText("Usuario"), "dashboard");
    await fireEvent.update(screen.getByPlaceholderText("Contraseña"), "mal");
    await fireEvent.click(screen.getByRole("button", { name: "Acceder" }));

    expect(
      await screen.findByText("Contraseña incorrecta")
    ).toBeInTheDocument();
    expect(
      await screen.findByText(
        "Se ha producido un error en la validación de los datos introducidos"
      )
    ).toBeInTheDocument();
  });

  // 📌 Test: Login correcto con redirección
  test("abre la URL correspondiente si el login es correcto", async () => {
    const spy = vi.spyOn(window, "open").mockImplementation(() => null);

    customRender();

    await fireEvent.update(screen.getByPlaceholderText("Usuario"), "dashboard");
    await fireEvent.update(screen.getByPlaceholderText("Contraseña"), "1234");
    await fireEvent.click(screen.getByRole("button", { name: "Acceder" }));

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        "https://kvothe73.github.io/dashboard-startup",
        "_blank"
      );
    });
  });

  // 📌 Test: Modal de recuperación y validación de email inválido
  test("muestra modal de recuperación y validación de email", async () => {
    customRender();

    await fireEvent.click(screen.getByText("¿Has olvidado tu contraseña?"));

    expect(
      screen.getByText("Restablecimiento de contraseña")
    ).toBeInTheDocument();

    const input = screen.getByPlaceholderText(
      "Introduce el Email asociado a tu cuenta"
    );
    await fireEvent.update(input, "invalido");
    await fireEvent.click(screen.getByText("Enviar"));

    expect(
      await screen.findByText("Error: Introduce un correo válido")
    ).toBeInTheDocument();
  });

  // 📌 Test: Email válido cierra modal
  test("acepta email válido y cierra modal tras éxito", async () => {
    customRender();

    await fireEvent.click(screen.getByText("¿Has olvidado tu contraseña?"));

    const input = screen.getByPlaceholderText(
      "Introduce el Email asociado a tu cuenta"
    );
    await fireEvent.update(input, "test@example.com");
    await fireEvent.click(screen.getByText("Enviar"));

    expect(
      await screen.findByText("Formulario enviado con éxito")
    ).toBeInTheDocument();
  });
});
