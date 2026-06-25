import { render, screen } from "@testing-library/react";

const notFoundMock = jest.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

jest.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));

jest.mock("@/components/Gallery", () => ({
  __esModule: true,
  default: () => <div data-testid="gallery" />,
}));

jest.mock("@/components/publicaciones/SolicitarPublicacionButton", () => ({
  __esModule: true,
  default: () => <button type="button">Solicitar publicación</button>,
}));

jest.mock("@/components/publicaciones/EditarPublicacionLink", () => ({
  __esModule: true,
  default: () => <a href="/editar">Editar publicación</a>,
}));

jest.mock("@/components/publicaciones/CambiarEstadoPublicacionButton", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/publicaciones/CancelarReservaButton", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/publicaciones/MarcarEntregadaButton", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/publicaciones/EliminarPublicacionButton", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/components/publicaciones/DenunciarPublicacionButton", () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock("@/lib/publicaciones", () => ({
  obtenerPublicacionPorId: jest.fn(),
}));

import { obtenerPublicacionPorId } from "@/lib/publicaciones";
import PublicacionDetailPage, { generateMetadata } from "./page";

const publicacionBackend = {
  id: "11111111-1111-4111-8111-111111111111",
  creadorId: "22222222-2222-4222-8222-222222222222",
  titulo: "Mesa de comedor",
  descripcion: "Mesa en buen estado",
  categoriaId: "550e8400-e29b-41d4-a716-446655440002",
  localidadId: "vl-olivos",
  condicion: "USADO_BUENO",
  imagenUrls: ["http://localhost/uploads/mesa.jpg"],
  estado: "DISPONIBLE",
  creadorNombreCompleto: "Juan Pérez",
};

describe("PublicacionDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el detalle desde el backend", async () => {
    (obtenerPublicacionPorId as jest.Mock).mockResolvedValue(publicacionBackend);

    const ui = await PublicacionDetailPage({
      params: Promise.resolve({ idPublicacion: publicacionBackend.id }),
    });
    render(ui);

    expect(screen.getByRole("heading", { name: "Mesa de comedor" })).toBeInTheDocument();
    expect(screen.getByText("Mesa en buen estado")).toBeInTheDocument();
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByTestId("gallery")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "← Volver a publicaciones" }),
    ).toHaveAttribute("href", "/publicaciones");
  });

  it("dispara notFound cuando el backend no devuelve la publicación", async () => {
    (obtenerPublicacionPorId as jest.Mock).mockResolvedValue(null);

    await expect(
      PublicacionDetailPage({
        params: Promise.resolve({ idPublicacion: "inexistente" }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFoundMock).toHaveBeenCalled();
  });

  it("genera metadata con el título de la publicación", async () => {
    (obtenerPublicacionPorId as jest.Mock).mockResolvedValue(publicacionBackend);

    const metadata = await generateMetadata({
      params: Promise.resolve({ idPublicacion: publicacionBackend.id }),
    });

    expect(metadata).toEqual({ title: "Mesa de comedor" });
  });
});
