import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

jest.mock("@/lib/publicaciones", () => ({
  crearPublicacionRequest: jest.fn(),
  subirImagenesPublicacionRequest: jest.fn(),
}));

import {
  crearPublicacionRequest,
  subirImagenesPublicacionRequest,
} from "@/lib/publicaciones";
import CrearPublicacionPage from "./page";

describe("CrearPublicacionPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (subirImagenesPublicacionRequest as jest.Mock).mockResolvedValue([]);
    (crearPublicacionRequest as jest.Mock).mockResolvedValue({
      id: "11111111-1111-4111-8111-111111111111",
    });
  });

  it("renderiza el formulario y el enlace para salir", () => {
    render(<CrearPublicacionPage />);

    expect(
      screen.getByRole("heading", { name: "Crear publicación" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Título")).toBeInTheDocument();
    expect(screen.getByLabelText("Descripción")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Salir" })).toHaveAttribute(
      "href",
      "/publicaciones",
    );
  });

  it("muestra error si no hay imágenes", async () => {
    render(<CrearPublicacionPage />);

    fireEvent.change(screen.getByLabelText("Título"), {
      target: { value: "Mesa de comedor" },
    });
    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "Mesa en buen estado para donar a una familia." },
    });

    fireEvent.click(screen.getByRole("button", { name: "Publicar" }));

    expect(
      await screen.findByText("Subí al menos una imagen o ingresá una URL."),
    ).toBeInTheDocument();
    expect(crearPublicacionRequest).not.toHaveBeenCalled();
  });

  it("crea la publicación con URL de imagen y redirige al detalle", async () => {
    render(<CrearPublicacionPage />);

    fireEvent.change(screen.getByLabelText("Título"), {
      target: { value: "Mesa de comedor" },
    });
    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "Mesa en buen estado para donar a una familia." },
    });
    fireEvent.change(
      screen.getByLabelText("URLs de imagen (opcional, una por línea)"),
      {
        target: { value: "http://localhost/uploads/mesa.jpg" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "Publicar" }));

    await waitFor(() => {
      expect(crearPublicacionRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          titulo: "Mesa de comedor",
          imagenUrls: ["http://localhost/uploads/mesa.jpg"],
        }),
      );
    });

    expect(pushMock).toHaveBeenCalledWith(
      "/publicaciones/publicacion/11111111-1111-4111-8111-111111111111",
    );
  });

  it("muestra error cuando falla la creación", async () => {
    (crearPublicacionRequest as jest.Mock).mockRejectedValue(
      new Error("No se pudo crear la publicación."),
    );

    render(<CrearPublicacionPage />);

    fireEvent.change(screen.getByLabelText("Título"), {
      target: { value: "Mesa de comedor" },
    });
    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "Mesa en buen estado para donar a una familia." },
    });
    fireEvent.change(
      screen.getByLabelText("URLs de imagen (opcional, una por línea)"),
      {
        target: { value: "http://localhost/uploads/mesa.jpg" },
      },
    );

    fireEvent.click(screen.getByRole("button", { name: "Publicar" }));

    expect(
      await screen.findByText("No se pudo crear la publicación."),
    ).toBeInTheDocument();
  });
});
