import { render, screen } from "@testing-library/react";

jest.mock("@/components/RemoteImage", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock("@/lib/publicaciones", () => ({
  listarPublicacionesDesdeBackend: jest.fn(),
}));

import { listarPublicacionesDesdeBackend } from "@/lib/publicaciones";
import PublicacionesPage from "./page";

const publicacionBackend = {
  id: "11111111-1111-4111-8111-111111111111",
  creadorId: "22222222-2222-4222-8222-222222222222",
  titulo: "Mesa",
  descripcion: "Mesa para donar",
  categoriaId: "550e8400-e29b-41d4-a716-446655440002",
  localidadId: "vl-olivos",
  condicion: "USADO_BUENO",
  imagenUrls: [],
  estado: "DISPONIBLE",
};

describe("PublicacionesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el listado de publicaciones", async () => {
    (listarPublicacionesDesdeBackend as jest.Mock).mockResolvedValue([
      publicacionBackend,
    ]);

    const ui = await PublicacionesPage({
      searchParams: Promise.resolve({ q: "mesa" }),
    });
    render(ui);

    expect(screen.getByRole("heading", { name: "Publicaciones" })).toBeInTheDocument();
    expect(screen.getByText("Mesa")).toBeInTheDocument();
    expect(screen.getByText("1 publicación en la base.")).toBeInTheDocument();
    expect(listarPublicacionesDesdeBackend).toHaveBeenCalledWith(
      undefined,
      undefined,
      undefined,
      "mesa",
    );
  });

  it("muestra mensaje vacío cuando no hay publicaciones", async () => {
    (listarPublicacionesDesdeBackend as jest.Mock).mockResolvedValue([]);

    const ui = await PublicacionesPage({
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(
      screen.getByText(
        "Todavía no hay publicaciones. Creá la primera con el botón de arriba.",
      ),
    ).toBeInTheDocument();
  });

  it("muestra error cuando falla la carga", async () => {
    (listarPublicacionesDesdeBackend as jest.Mock).mockRejectedValue(
      new Error("backend caído"),
    );

    const ui = await PublicacionesPage({
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(
      screen.getByText(
        "No se pudieron cargar las publicaciones. ¿Está corriendo el backend?",
      ),
    ).toBeInTheDocument();
  });
});
