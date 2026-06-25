import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const pushMock = jest.fn();
const PUBLICACION_ID = "11111111-1111-4111-8111-111111111111";
const CREADOR_ID = "22222222-2222-4222-8222-222222222222";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
  useParams: () => ({ idPublicacion: PUBLICACION_ID }),
}));

jest.mock("@/components/RemoteImage", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock("@/lib/publicaciones", () => ({
  obtenerPublicacionRequest: jest.fn(),
  editarPublicacionRequest: jest.fn(),
  subirImagenesPublicacionRequest: jest.fn(),
  obtenerUrlsImagenInvalidas: jest.fn().mockResolvedValue([]),
}));

import {
  editarPublicacionRequest,
  obtenerPublicacionRequest,
} from "@/lib/publicaciones";
import EditarPublicacionPage from "./page";

const publicacionBackend = {
  id: PUBLICACION_ID,
  creadorId: CREADOR_ID,
  titulo: "Mesa",
  descripcion: "Mesa para donar en buen estado",
  categoriaId: "550e8400-e29b-41d4-a716-446655440002",
  localidadId: "vl-olivos",
  condicion: "USADO_BUENO",
  imagenUrls: ["http://localhost/uploads/mesa.jpg"],
  estado: "DISPONIBLE",
};

function mockCargaExitosa() {
  (obtenerPublicacionRequest as jest.Mock).mockResolvedValue(publicacionBackend);
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: CREADOR_ID }),
  });
}

describe("EditarPublicacionPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn(() => "token-falso");
    (editarPublicacionRequest as jest.Mock).mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
  });

  it("redirige a login sin token", async () => {
    Storage.prototype.getItem = jest.fn(() => null);
    mockCargaExitosa();

    render(<EditarPublicacionPage />);

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/login");
    });
  });

  it("muestra sin permiso si el usuario no es el creador", async () => {
    (obtenerPublicacionRequest as jest.Mock).mockResolvedValue(publicacionBackend);
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ id: "otro-usuario" }),
    });

    render(<EditarPublicacionPage />);

    expect(
      await screen.findByRole("heading", { name: "Sin permiso" }),
    ).toBeInTheDocument();
  });

  it("muestra publicación no encontrada", async () => {
    (obtenerPublicacionRequest as jest.Mock).mockRejectedValue(
      new Error("Error 404"),
    );

    render(<EditarPublicacionPage />);

    expect(
      await screen.findByText("Publicación no encontrada."),
    ).toBeInTheDocument();
  });

  it("carga el formulario para el creador", async () => {
    mockCargaExitosa();

    render(<EditarPublicacionPage />);

    expect(await screen.findByLabelText("Título")).toHaveValue("Mesa");
    expect(screen.getByLabelText("Descripción")).toHaveValue(
      "Mesa para donar en buen estado",
    );
    expect(
      screen.getByRole("link", { name: "Salir" }),
    ).toHaveAttribute("href", `/publicaciones/publicacion/${PUBLICACION_ID}`);
  });

  it("guarda cambios y redirige al detalle", async () => {
    mockCargaExitosa();

    render(<EditarPublicacionPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Guardar cambios" }),
    );

    await waitFor(() => {
      expect(editarPublicacionRequest).toHaveBeenCalledWith(
        PUBLICACION_ID,
        expect.objectContaining({
          titulo: "Mesa",
          imagenUrls: ["http://localhost/uploads/mesa.jpg"],
        }),
      );
    });

    expect(pushMock).toHaveBeenCalledWith(
      `/publicaciones/publicacion/${PUBLICACION_ID}`,
    );
  });

  it("muestra error cuando falla el guardado", async () => {
    mockCargaExitosa();
    (editarPublicacionRequest as jest.Mock).mockRejectedValue(
      new Error("No se pudo editar la publicación."),
    );

    render(<EditarPublicacionPage />);

    fireEvent.click(
      await screen.findByRole("button", { name: "Guardar cambios" }),
    );

    expect(
      await screen.findByText("No se pudo editar la publicación."),
    ).toBeInTheDocument();
  });
});
