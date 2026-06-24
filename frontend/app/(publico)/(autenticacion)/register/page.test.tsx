import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import RegisterPage from "./page";

const pushMock = jest.fn();
const refreshMock = jest.fn();
const registerRequestMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

jest.mock("@/lib/auth", () => ({
  registerRequest: (...args: unknown[]) => registerRequestMock(...args),
}));

function getEmailInputs(container: HTMLElement) {
  return container.querySelectorAll<HTMLInputElement>(
    'input[type="email"]',
  );
}

function getPasswordInputs(container: HTMLElement) {
  return container.querySelectorAll<HTMLInputElement>(
    'input[type="password"]',
  );
}

function fillRegisterForm(
  container: HTMLElement,
  overrides: Partial<{
    correo: string;
    correoConfirmacion: string;
    contrasenia: string;
    contraseniaConfirmacion: string;
    nombreUsuario: string;
    nombreCompleto: string;
    numeroTelefono: string;
  }> = {},
) {
  const values = {
    correo: "juan@test.com",
    correoConfirmacion: "juan@test.com",
    contrasenia: "Secreta1",
    contraseniaConfirmacion: "Secreta1",
    nombreUsuario: "juan",
    nombreCompleto: "Juan Perez",
    numeroTelefono: "+54 9 11 1234 5678",
    ...overrides,
  };

  const [correo, correoConfirmacion] = getEmailInputs(container);
  const [contrasenia, contraseniaConfirmacion] =
    getPasswordInputs(container);

  fireEvent.change(correo, { target: { value: values.correo } });
  fireEvent.change(correoConfirmacion, {
    target: { value: values.correoConfirmacion },
  });
  fireEvent.change(contrasenia, {
    target: { value: values.contrasenia },
  });
  fireEvent.change(contraseniaConfirmacion, {
    target: { value: values.contraseniaConfirmacion },
  });
  fireEvent.change(screen.getByLabelText("Nombre de usuario"), {
    target: { value: values.nombreUsuario },
  });
  fireEvent.change(screen.getByLabelText("Nombre completo"), {
    target: { value: values.nombreCompleto },
  });
  fireEvent.change(screen.getByLabelText("Número de teléfono"), {
    target: { value: values.numeroTelefono },
  });
}

describe("RegisterPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    registerRequestMock.mockResolvedValue({ message: "Cuenta creada." });
  });

  it("renderiza el formulario y el enlace de navegación", () => {
    render(<RegisterPage />);

    expect(
      screen.getByRole("heading", { name: "Registrarse" }),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Llene el formulario para crear una cuenta."),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Correo")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Confirme su correo"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Confirme su contraseña"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Nombre de usuario"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Nombre completo"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Número de teléfono"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Inicia sesión" }),
    ).toHaveAttribute("href", "/login");
  });

  it("muestra error cuando las contraseñas no coinciden", async () => {
    const { container } = render(<RegisterPage />);

    fillRegisterForm(container, {
      contraseniaConfirmacion: "Otra1234",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Registrarse" }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Las contraseñas no coinciden.");

    expect(registerRequestMock).not.toHaveBeenCalled();
  });

  it("muestra error cuando los correos no coinciden", async () => {
    const { container } = render(<RegisterPage />);

    fillRegisterForm(container, {
      correoConfirmacion: "otro@test.com",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Registrarse" }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Los correos no coinciden.");

    expect(registerRequestMock).not.toHaveBeenCalled();
  });

  it("muestra error cuando el formato del correo no es válido", async () => {
    const { container } = render(<RegisterPage />);

    fillRegisterForm(container, {
      correo: "sin-dominio@",
      correoConfirmacion: "sin-dominio@",
    });

    fireEvent.submit(container.querySelector("form")!);

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("El formato del correo no es válido.");

    expect(registerRequestMock).not.toHaveBeenCalled();
  });

  it("muestra error cuando el formato de la contraseña no es válido", async () => {
    const { container } = render(<RegisterPage />);

    fillRegisterForm(container, {
      contrasenia: "corta1",
      contraseniaConfirmacion: "corta1",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Registrarse" }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("El formato de la contraseña no es valido");

    expect(registerRequestMock).not.toHaveBeenCalled();
  });

  it("registra al usuario y redirige al login cuando el envío es exitoso", async () => {
    const { container } = render(<RegisterPage />);

    fillRegisterForm(container, {
      correo: "  juan@test.com  ",
      correoConfirmacion: "juan@test.com",
      numeroTelefono: "+54 9 11 1234 5678",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Registrarse" }),
    );

    await waitFor(() => {
      expect(registerRequestMock).toHaveBeenCalledWith({
        correo: "juan@test.com",
        contrasenia: "Secreta1",
        nombreUsuario: "juan",
        nombreCompleto: "Juan Perez",
        numeroTelefono: "+5491112345678",
      });
    });

    expect(pushMock).toHaveBeenCalledWith("/login");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("muestra error cuando falla el registro", async () => {
    registerRequestMock.mockRejectedValue(
      new Error("Campos invalidos o correo/nombre de usuario ya registrado."),
    );

    const { container } = render(<RegisterPage />);
    fillRegisterForm(container);

    fireEvent.click(
      screen.getByRole("button", { name: "Registrarse" }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Campos invalidos o correo/nombre de usuario ya registrado.",
    );

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("muestra estado de carga mientras se registra el usuario", async () => {
    let resolveRequest: (value: unknown) => void;
    registerRequestMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const { container } = render(<RegisterPage />);
    fillRegisterForm(container);

    fireEvent.click(
      screen.getByRole("button", { name: "Registrarse" }),
    );

    expect(
      await screen.findByRole("button", { name: "Registrando..." }),
    ).toBeDisabled();

    resolveRequest!({ message: "Cuenta creada." });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Registrarse" }),
      ).not.toBeDisabled();
    });
  });
});
