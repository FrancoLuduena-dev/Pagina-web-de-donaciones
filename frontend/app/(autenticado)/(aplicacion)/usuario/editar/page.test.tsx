import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import EditarUsuarioPage from "./page";

const pushMock = jest.fn();
const refreshMock = jest.fn();
const editarPerfilRequestMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

jest.mock("@/lib/auth", () => ({
  editarPerfilRequest: (...args: unknown[]) =>
    editarPerfilRequestMock(...args),
}));

function getEmailInputs(container: HTMLElement) {
  return container.querySelectorAll<HTMLInputElement>(
    'input[type="email"]',
  );
}

describe("EditarUsuarioPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    editarPerfilRequestMock.mockResolvedValue({});
  });

  it("renderiza el formulario y los enlaces de navegación", () => {
    render(<EditarUsuarioPage />);

    expect(
      screen.getByRole("heading", {
        name: "Editar informacion de perfil",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Los campos que deje vacios no seran modificados.",
      ),
    ).toBeInTheDocument();

    expect(screen.getByLabelText("Correo")).toBeInTheDocument();
    expect(
      screen.getByLabelText("confirme su correo"),
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
      screen.getByRole("link", { name: "ingresa aca" }),
    ).toHaveAttribute("href", "/usuario/reset-password");

    expect(
      screen.getByRole("link", { name: "volver atras" }),
    ).toHaveAttribute("href", "/usuario");
  });

  it("muestra error cuando los correos no coinciden", async () => {
    const { container } = render(<EditarUsuarioPage />);
    const [correo, correoConfirmacion] = getEmailInputs(container);

    fireEvent.change(correo, {
      target: { value: "uno@test.com" },
    });
    fireEvent.change(correoConfirmacion, {
      target: { value: "dos@test.com" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Actualizar perfil" }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Los correos no coinciden.");

    expect(editarPerfilRequestMock).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("envía los datos y redirige cuando la actualización es exitosa", async () => {
    const { container } = render(<EditarUsuarioPage />);
    const [correo, correoConfirmacion] = getEmailInputs(container);

    fireEvent.change(correo, {
      target: { value: "  juan@test.com  " },
    });
    fireEvent.change(correoConfirmacion, {
      target: { value: "juan@test.com" },
    });
    fireEvent.change(screen.getByLabelText("Nombre de usuario"), {
      target: { value: "juan" },
    });
    fireEvent.change(screen.getByLabelText("Nombre completo"), {
      target: { value: "Juan Perez" },
    });
    fireEvent.change(screen.getByLabelText("Número de teléfono"), {
      target: { value: "+54 9 11 1234 5678" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Actualizar perfil" }),
    );

    await waitFor(() => {
      expect(editarPerfilRequestMock).toHaveBeenCalledWith({
        correo: "juan@test.com",
        nombreUsuario: "juan",
        nombreCompleto: "Juan Perez",
        numeroTelefono: "5491112345678",
      });
    });

    expect(pushMock).toHaveBeenCalledWith("/usuario");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("muestra error cuando falla la actualización", async () => {
    editarPerfilRequestMock.mockRejectedValue(
      new Error("Formato de los campos inválido."),
    );

    render(<EditarUsuarioPage />);

    fireEvent.change(screen.getByLabelText("Nombre de usuario"), {
      target: { value: "juan" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Actualizar perfil" }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent("Formato de los campos inválido.");

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("muestra estado de carga mientras se actualiza el perfil", async () => {
    let resolveRequest: (value: unknown) => void;
    editarPerfilRequestMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    render(<EditarUsuarioPage />);

    fireEvent.change(screen.getByLabelText("Nombre de usuario"), {
      target: { value: "juan" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Actualizar perfil" }),
    );

    expect(
      await screen.findByRole("button", { name: "actualizando..." }),
    ).toBeDisabled();

    resolveRequest!({});

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Actualizar perfil" }),
      ).not.toBeDisabled();
    });
  });
});
