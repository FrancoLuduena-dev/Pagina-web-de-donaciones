import { render, screen, waitFor } from "@testing-library/react";
import UsuarioPage from "./page";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock(
  "@/components/usuarios/cards/TarjetaResumen/TarjetaResumen",
  () => ({
    __esModule: true,
    default: ({ titulo }: { titulo: string }) => (
      <div data-testid="tarjeta-resumen">
        {titulo}
      </div>
    ),
  }),
);

jest.mock(
  "@/components/usuarios/botones/BotonLink",
  () => ({
    __esModule: true,
    default: ({ texto }: { texto: string }) => (
      <div data-testid="boton-link">
        {texto}
      </div>
    ),
  }),
);

describe("UsuarioPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Storage.prototype.getItem = jest
      .fn()
      .mockReturnValue("token-valido");
  });

  it("renderiza correctamente los datos del usuario", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          nombreUsuario: "juan",
          correo: "juan@test.com",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [{ id: 1 }, { id: 2 }],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          { estado: "PENDIENTE" },
          { estado: "ACEPTADA" },
        ],
      });

    render(<UsuarioPage />);

    expect(
      await screen.findByText("Hola, juan")
    ).toBeInTheDocument();

    expect(
      screen.getByText("juan@test.com")
    ).toBeInTheDocument();

    expect(
      screen.getAllByTestId("tarjeta-resumen")
    ).toHaveLength(3);

    expect(
      screen.getAllByTestId("boton-link")
    ).toHaveLength(4);
  });

  it("muestra un error si falla la carga del perfil", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error("Error"));

    render(<UsuarioPage />);

    expect(
      await screen.findByText(
        "Ocurrió un error al cargar el perfil."
      )
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled();
    });
  });
});