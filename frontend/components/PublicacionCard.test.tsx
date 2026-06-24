import { render, screen } from "@testing-library/react";

import PublicacionCard from "@/components/PublicacionCard";
import { CategoriaPublicacion } from "@/types/CategoriaPublicacion";
import { EstadoDonacion } from "@/types/EstadoDonacion";
import { EstadoPublicacion } from "@/types/EstadoPublicacion";
import type { PublicacionResumen } from "@/types/PublicacionResumen";

jest.mock("@/components/RemoteImage", () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => <img alt={alt} />,
}));

describe("PublicacionCard", () => {
  const publicacionBase: PublicacionResumen = {
    idPublicacion: "11111111-1111-4111-8111-111111111111",
    tituloPublicacion: "Mesa de comedor",
    descripcionPublicacion: "Mesa en buen estado para donar.",
    urlFoto: "http://localhost:3000/uploads/publicaciones/mesa.jpg",
    categoria: CategoriaPublicacion.MUEBLES,
    zonaRetiro: "Olivos",
    estadoPublicacion: EstadoPublicacion.DISPONIBLE,
    estadoDonacion: EstadoDonacion.USADO,
  };

  it("muestra título, descripción, categoría y estado", () => {
    render(<PublicacionCard publicacion={publicacionBase} />);

    expect(screen.getByText("Mesa de comedor")).toBeInTheDocument();
    expect(
      screen.getByText("Mesa en buen estado para donar."),
    ).toBeInTheDocument();
    expect(screen.getByText("Muebles")).toBeInTheDocument();
    expect(screen.getByText("Disponible")).toBeInTheDocument();
    expect(screen.getByText("Olivos")).toBeInTheDocument();
    expect(screen.getByText("Usado")).toBeInTheDocument();
  });

  it("enlaza al detalle por defecto", () => {
    render(<PublicacionCard publicacion={publicacionBase} />);

    const link = screen.getByRole("link", { name: "Ver publicación" });
    expect(link).toHaveAttribute(
      "href",
      "/publicaciones/publicacion/11111111-1111-4111-8111-111111111111",
    );
  });

  it("muestra placeholder cuando no hay imagen", () => {
    render(
      <PublicacionCard
        publicacion={{ ...publicacionBase, urlFoto: "" }}
      />,
    );

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("oculta el enlace cuando href es null", () => {
    render(<PublicacionCard publicacion={publicacionBase} href={null} />);

    expect(
      screen.queryByRole("link", { name: "Ver publicación" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("No disponible")).toBeInTheDocument();
  });
});
