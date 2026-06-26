import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock("@/components/RemoteImage", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock("@/lib/publicaciones", () => ({
  listarMisPublicacionesRequest: jest.fn(),
}));

import { listarMisPublicacionesRequest } from "@/lib/publicaciones";
import MisPublicacionesPage from "./page";

const publicacionMesa = {
  id: "11111111-1111-4111-8111-111111111111",
  creadorId: "22222222-2222-4222-8222-222222222222",
  titulo: "Mesa",
  descripcion: "Mesa para donar",
  categoriaId: "550e8400-e29b-41d4-a716-446655440002",
  localidadId: "vl-olivos",
  condicion: "USADO_BUENO",
  imagenUrls: [] as string[],
  estado: "DISPONIBLE",
};

describe("MisPublicacionesPage", () => {
  beforeEach(() => {
    pushMock.mockClear();
    Storage.prototype.getItem = jest.fn(() => "token-falso");
    (listarMisPublicacionesRequest as jest.Mock).mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("renderiza publicaciones y permite filtrar por estado", async () => {
    (listarMisPublicacionesRequest as jest.Mock).mockImplementation(
      (estado?: string) =>
        Promise.resolve(estado === "RESERVADA" ? [] : [publicacionMesa]),
    );

    const { unmount } = render(<MisPublicacionesPage />);

    expect(await screen.findByText("Mesa")).toBeInTheDocument();
    expect(screen.getByText("1 publicación en total.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Reservadas" }));

    await waitFor(() => {
      expect(listarMisPublicacionesRequest).toHaveBeenLastCalledWith("RESERVADA");
    });

    expect(
      await screen.findByText("No tenés publicaciones con ese estado."),
    ).toBeInTheDocument();

    unmount();
  });

  it("muestra mensaje vacío cuando no hay publicaciones", async () => {
    (listarMisPublicacionesRequest as jest.Mock).mockResolvedValue([]);

    render(<MisPublicacionesPage />);

    await waitFor(() => {
      expect(screen.getByText("Todavía no publicaste nada.")).toBeInTheDocument();
      expect(
        screen.queryByText("Cargando publicaciones..."),
      ).not.toBeInTheDocument();
    });
  });

  it("redirige a login si no hay token", async () => {
    Storage.prototype.getItem = jest.fn(() => null);

    render(<MisPublicacionesPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  it("muestra error cuando falla la carga", async () => {
    (listarMisPublicacionesRequest as jest.Mock).mockRejectedValue(
      new Error("Error de red"),
    );

    render(<MisPublicacionesPage />);

    expect(await screen.findByText("Error de red")).toBeInTheDocument();
  });
});
