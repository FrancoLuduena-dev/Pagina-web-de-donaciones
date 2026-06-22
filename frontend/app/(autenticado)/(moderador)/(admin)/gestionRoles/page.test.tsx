import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ModeracionPage from "./page";
import { RolUsuario } from "@/types/RolUsuario";

jest.mock(
  "@/components/moderacion/buscadorUsuario/BuscadorUsuario",
  () => ({
    __esModule: true,
    default: ({
      onBuscar,
    }: {
      onBuscar: () => void;
    }) => (
      <button
        data-testid="buscar"
        onClick={onBuscar}
      >
        Buscar
      </button>
    ),
  }),
);

describe("ModeracionPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Storage.prototype.getItem = jest
      .fn()
      .mockReturnValue("token");
  });

  it("muestra error cuando no encuentra el usuario", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    });

    render(<ModeracionPage />);

    fireEvent.click(
      screen.getByTestId("buscar")
    );

    expect(
      await screen.findByText(
        "No se encontró el usuario."
      )
    ).toBeInTheDocument();
  });

  it("muestra los datos del usuario encontrado", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "1",
        nombreCompleto: "Juan Perez",
        nombreUsuario: "juan",
        correo: "juan@test.com",
        rol: RolUsuario.usuarioModerador,
        estado: "ACTIVO",
      }),
    });

    render(<ModeracionPage />);

    fireEvent.click(
      screen.getByTestId("buscar")
    );

    expect(
      await screen.findByText("Juan Perez")
    ).toBeInTheDocument();

    expect(
      screen.getByText("juan")
    ).toBeInTheDocument();

    expect(
      screen.getByText("juan@test.com")
    ).toBeInTheDocument();

    expect(
      screen.getByText("ACTIVO")
    ).toBeInTheDocument();
  });

  it("muestra advertencia para administradores", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "1",
        nombreCompleto: "Admin",
        nombreUsuario: "admin",
        correo: "admin@test.com",
        rol: RolUsuario.usuarioAdministrador,
        estado: "ACTIVO",
      }),
    });

    render(<ModeracionPage />);

    fireEvent.click(
      screen.getByTestId("buscar")
    );

    expect(
      await screen.findByText(
        /no puede modificarse/i
      )
    ).toBeInTheDocument();
  });

  it("permite abrir el modal de confirmación", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: "1",
        nombreCompleto: "Juan",
        nombreUsuario: "juan",
        correo: "juan@test.com",
        rol: RolUsuario.usuarioNormal,
        estado: "ACTIVO",
      }),
    });

    render(<ModeracionPage />);

    fireEvent.click(
      screen.getByTestId("buscar")
    );

    await screen.findByText("Juan");

    fireEvent.change(
      screen.getByLabelText(/nuevo rol/i),
      {
        target: {
          value: RolUsuario.usuarioModerador,
        },
      }
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /guardar cambios/i,
      })
    );

    expect(
      screen.getByText(
        /confirmar cambio/i
      )
    ).toBeInTheDocument();
  });
});