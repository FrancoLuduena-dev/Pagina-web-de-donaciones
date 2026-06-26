import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ResetPasswordPage from "./page";

const pushMock = jest.fn();
const refreshMock = jest.fn();
const resetPasswordRequestMock = jest.fn();

jest.mock("next/dist/client/components/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

jest.mock("@/lib/auth", () => ({
  resetPasswordRequest: (...args: unknown[]) =>
    resetPasswordRequestMock(...args),
}));

function fillPasswordForm(
  container: HTMLElement,
  values: {
    actual: string;
    nueva: string;
    confirmacion: string;
  },
) {
  fireEvent.change(
    container.querySelector("#contraseniaActual")!,
    { target: { value: values.actual } },
  );
  fireEvent.change(
    container.querySelector("#contraseniaNueva")!,
    { target: { value: values.nueva } },
  );
  fireEvent.change(
    container.querySelector("#contraseniaNuevaDos")!,
    { target: { value: values.confirmacion } },
  );
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetPasswordRequestMock.mockResolvedValue({});
  });

  it("renderiza el formulario y el enlace de navegación", () => {
    render(<ResetPasswordPage />);

    expect(
      screen.getByRole("heading", {
        name: "Restablecer contraseña",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Para restablecer tu contraseña, por favor llene los siguientes campos.",
      ),
    ).toBeInTheDocument();

    expect(
      document.getElementById("contraseniaActual"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("ingrese la nueva contraseña"),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("vuelva a ingresar la nueva contraseña"),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: "Volver atras" }),
    ).toHaveAttribute("href", "/usuario/editar");
  });

  it("envía los datos y redirige al login cuando el restablecimiento es exitoso", async () => {
    const { container } = render(<ResetPasswordPage />);

    fillPasswordForm(container, {
      actual: "  actual123  ",
      nueva: "  nueva456  ",
      confirmacion: "nueva456",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Restablecer" }),
    );

    await waitFor(() => {
      expect(resetPasswordRequestMock).toHaveBeenCalledWith({
        contraseniaActual: "actual123",
        contraseniaNueva: "nueva456",
      });
    });

    expect(pushMock).toHaveBeenCalledWith("/login");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("muestra error cuando falla el restablecimiento", async () => {
    resetPasswordRequestMock.mockRejectedValue(
      new Error(
        "Las contraseñas no coinciden o la contraseña actual es incorrecta.",
      ),
    );

    const { container } = render(<ResetPasswordPage />);

    fillPasswordForm(container, {
      actual: "actual123",
      nueva: "nueva456",
      confirmacion: "nueva456",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Restablecer" }),
    );

    expect(
      await screen.findByRole("alert"),
    ).toHaveTextContent(
      "Las contraseñas no coinciden o la contraseña actual es incorrecta.",
    );

    expect(pushMock).not.toHaveBeenCalled();
  });

  it("muestra estado de carga mientras se restablece la contraseña", async () => {
    let resolveRequest: (value: unknown) => void;
    resetPasswordRequestMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRequest = resolve;
        }),
    );

    const { container } = render(<ResetPasswordPage />);

    fillPasswordForm(container, {
      actual: "actual123",
      nueva: "nueva456",
      confirmacion: "nueva456",
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Restablecer" }),
    );

    expect(
      await screen.findByRole("button", { name: "Restableciendo..." }),
    ).toBeDisabled();

    resolveRequest!({});

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Restablecer" }),
      ).not.toBeDisabled();
    });
  });
});
