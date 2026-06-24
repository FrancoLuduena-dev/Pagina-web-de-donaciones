import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import LoginPage from "./page";

const pushMock = jest.fn();
const refreshMock = jest.fn();
const loginRequestMock = jest.fn();
const persistSessionMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

jest.mock("@/lib/auth", () => ({
  loginRequest: (...args: unknown[]) => loginRequestMock(...args),
  persistSession: (...args: unknown[]) => persistSessionMock(...args),
}));

const loginResponse = {
  accessToken: "token-test",
  user: {
    id: 1,
    correo: "juan@test.com",
    rol: "USUARIO",
  },
};

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    loginRequestMock.mockResolvedValue(loginResponse);
  });

  it("renderiza el formulario y los enlaces de navegación", () => {
    render(<LoginPage />);

    expect(
      screen.getByRole("heading", { name: "Iniciar sesión" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Accedé a tu cuenta para seguir donando."),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Correo")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Volver al inicio" }),
    ).toHaveAttribute("href", "/");

    expect(
      screen.getByRole("link", { name: "Registrate" }),
    ).toHaveAttribute("href", "/register");

    expect(
      screen.getByText(/Olvidaste tu contraseña/i),
    ).toBeInTheDocument();
  });

  it("inicia sesión, persiste la sesión y redirige a publicaciones", async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Correo"), {
      target: { value: "  juan@test.com  " },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "secreta123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(loginRequestMock).toHaveBeenCalledWith({
        correo: "juan@test.com",
        contrasenia: "secreta123",
      });
    });

    expect(persistSessionMock).toHaveBeenCalledWith(loginResponse);
    expect(pushMock).toHaveBeenCalledWith("/publicaciones");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("muestra error cuando falla el inicio de sesión", async () => {
    loginRequestMock.mockRejectedValue(
      new Error("Correo o contraseña incorrectos."),
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Correo"), {
      target: { value: "juan@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "incorrecta" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Correo o contraseña incorrectos.");

    expect(persistSessionMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("muestra estado de carga mientras se inicia sesión", async () => {
    let resolveRequest: (value: unknown) => void;
    loginRequestMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    render(<LoginPage />);

    fireEvent.change(screen.getByLabelText("Correo"), {
      target: { value: "juan@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "secreta123" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByRole("button", { name: "Entrando…" }),
    ).toBeDisabled();

    resolveRequest!(loginResponse);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Entrar" }),
      ).not.toBeDisabled();
    });
  });
});
