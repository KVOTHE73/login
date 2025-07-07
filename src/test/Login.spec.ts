import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/vue";
import Login from "@/views/Login.vue";
import { createTestingPinia } from "@pinia/testing";
import { createI18n } from "vue-i18n";

// Mensajes mínimos para pruebas
const messages = {
  es: {
    login: {
      userLabel: "Usuario",
      passwordLabel: "Contraseña",
      loginButton: "Acceder",
      errors: {
        required: "Este campo es obligatorio",
        userNotFound: "Usuario no encontrado",
        wrongPassword: "Contraseña incorrecta",
      },
    },
  },
};

const i18n = createI18n({
  legacy: false,
  locale: "es",
  messages,
});

const customRender = () =>
  render(Login, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
          stubActions: false,
        }),
        i18n,
      ],
    },
  });

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("Login.vue", () => {
  it("renderiza correctamente el formulario", async () => {
    customRender();

    expect(screen.getByLabelText("Usuario")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByText("Acceder")).toBeInTheDocument();
  });

  it("valida campos vacíos al enviar", async () => {
    customRender();

    await fireEvent.click(screen.getByText("Acceder"));

    expect(
      await screen.findAllByText("Este campo es obligatorio")
    ).toHaveLength(2);
  });

  it("muestra error si el usuario no existe", async () => {
    const userInput = screen.getByLabelText("Usuario");
    const passInput = screen.getByLabelText("Contraseña");

    await fireEvent.update(userInput, "usuario-inexistente");
    await fireEvent.update(passInput, "123456");
    await fireEvent.click(screen.getByText("Acceder"));

    expect(
      await screen.findByText("Usuario no encontrado")
    ).toBeInTheDocument();
  });

  it("muestra error si la contraseña es incorrecta", async () => {
    customRender();

    const userInput = screen.getByLabelText("Usuario");
    const passInput = screen.getByLabelText("Contraseña");

    await fireEvent.update(userInput, "usuario-valido");
    await fireEvent.update(passInput, "wrongpass");
    await fireEvent.click(screen.getByText("Acceder"));

    expect(
      await screen.findByText("Contraseña incorrecta")
    ).toBeInTheDocument();
  });

  it("acceso correcto abre URL externa", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    customRender();

    const userInput = screen.getByLabelText("Usuario");
    const passInput = screen.getByLabelText("Contraseña");

    await fireEvent.update(userInput, "usuario-valido");
    await fireEvent.update(passInput, "correctpass");
    await fireEvent.click(screen.getByText("Acceder"));

    expect(openSpy).toHaveBeenCalledWith(
      "https://kvothe73.github.io/dashboard-startup",
      "_blank"
    );
  });
});
