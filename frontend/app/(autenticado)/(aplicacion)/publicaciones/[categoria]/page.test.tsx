import { render, screen } from "@testing-library/react";

jest.mock("@/components/RemoteImage", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock("@/lib/publicaciones", () => ({
  listarPublicacionesDesdeBackend: jest.fn(),
}));

import { listarPublicacionesDesdeBackend } from "@/lib/publicaciones";
import CategoriaPage from "./page";

const publicacionBackend = {
  id: "11111111-1111-4111-8111-111111111111",
  creadorId: "22222222-2222-4222-8222-222222222222",
  titulo: "Silla",
  descripcion: "Silla para donar",
  categoriaId: "550e8400-e29b-41d4-a716-446655440002",
  localidadId: "vl-olivos",
  condicion: "NUEVO",
  imagenUrls: [],
  estado: "DISPONIBLE",
};

describe("CategoriaPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza publicaciones filtradas por categoría", async () => {
    (listarPublicacionesDesdeBackend as jest.Mock).mockResolvedValue([
      publicacionBackend,
    ]);

    const ui = await CategoriaPage({
      params: Promise.resolve({ categoria: "muebles" }),
      searchParams: Promise.resolve({ estado: "DISPONIBLE" }),
    });
    render(ui);

    expect(screen.getByRole("heading", { name: "Muebles" })).toBeInTheDocument();
    expect(screen.getByText("Silla")).toBeInTheDocument();
    expect(listarPublicacionesDesdeBackend).toHaveBeenCalledWith(
      "550e8400-e29b-41d4-a716-446655440002",
      undefined,
      "DISPONIBLE",
      undefined,
    );
  });

  it("muestra mensaje vacío para la categoría", async () => {
    (listarPublicacionesDesdeBackend as jest.Mock).mockResolvedValue([]);

    const ui = await CategoriaPage({
      params: Promise.resolve({ categoria: "alimentos" }),
      searchParams: Promise.resolve({}),
    });
    render(ui);

    expect(
      screen.getByText("No hay publicaciones para esta categoría."),
    ).toBeInTheDocument();
  });

  it("muestra error cuando falla la carga", async () => {
    (listarPublicacionesDesdeBackend as jest.Mock).mockRejectedValue(
      new Error("error"),
    );

    const ui = await CategoriaPage({
      params: Promise.resolve({ categoria: "otros" }),
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
