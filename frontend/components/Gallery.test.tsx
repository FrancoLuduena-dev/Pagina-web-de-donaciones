import { fireEvent, render, screen } from "@testing-library/react";

import Gallery from "@/components/Gallery";

jest.mock("@/components/RemoteImage", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}));

describe("Gallery", () => {
  const images = [
    "http://localhost/uno.jpg",
    "http://localhost/dos.jpg",
    "http://localhost/tres.jpg",
  ];

  it("con una sola imagen no muestra navegación, contador ni miniaturas", () => {
    render(<Gallery images={["http://localhost/uno.jpg"]} />);

    expect(screen.getByAltText("Imagen 1")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Imagen siguiente" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/Imagen 1 de/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Ver imagen 1" }),
    ).not.toBeInTheDocument();
  });

  it("con varias imágenes muestra navegación, contador y miniaturas", () => {
    render(<Gallery images={images} />);

    expect(screen.getByText("Imagen 1 de 3")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Imagen anterior" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Imagen siguiente" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ver imagen 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Ver imagen 3" }),
    ).toBeInTheDocument();
  });

  it("el botón siguiente avanza la imagen principal", () => {
    render(<Gallery images={images} />);

    fireEvent.click(screen.getByRole("button", { name: "Imagen siguiente" }));

    expect(screen.getByText("Imagen 2 de 3")).toBeInTheDocument();
    expect(screen.getByAltText("Imagen 2")).toHaveAttribute(
      "src",
      "http://localhost/dos.jpg",
    );
  });

  it("el botón anterior vuelve a la última imagen desde la primera", () => {
    render(<Gallery images={images} />);

    fireEvent.click(screen.getByRole("button", { name: "Imagen anterior" }));

    expect(screen.getByText("Imagen 3 de 3")).toBeInTheDocument();
    expect(screen.getByAltText("Imagen 3")).toHaveAttribute(
      "src",
      "http://localhost/tres.jpg",
    );
  });

  it("el botón siguiente vuelve a la primera imagen desde la última", () => {
    render(<Gallery images={images} />);

    const next = screen.getByRole("button", { name: "Imagen siguiente" });
    fireEvent.click(next);
    fireEvent.click(next);
    expect(screen.getByText("Imagen 3 de 3")).toBeInTheDocument();

    fireEvent.click(next);
    expect(screen.getByText("Imagen 1 de 3")).toBeInTheDocument();
  });

  it("al hacer clic en una miniatura muestra esa imagen", () => {
    render(<Gallery images={images} />);

    fireEvent.click(screen.getByRole("button", { name: "Ver imagen 3" }));

    expect(screen.getByText("Imagen 3 de 3")).toBeInTheDocument();
    expect(screen.getByAltText("Imagen 3")).toHaveAttribute(
      "src",
      "http://localhost/tres.jpg",
    );
  });

  it("limita la cantidad de imágenes con maxImages", () => {
    const muchas = [
      "http://localhost/1.jpg",
      "http://localhost/2.jpg",
      "http://localhost/3.jpg",
      "http://localhost/4.jpg",
    ];

    render(<Gallery images={muchas} maxImages={2} />);

    expect(screen.getByText("Imagen 1 de 2")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Ver imagen 3" }),
    ).not.toBeInTheDocument();
  });
});
