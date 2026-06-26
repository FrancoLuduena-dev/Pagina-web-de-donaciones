import { render, screen } from "@testing-library/react";
import Navbar from "./Navbar";
import { tituloPagina } from "@/constants/site";

jest.mock(
  "@/components/layout/navbar/botonUsuario/MenuUsuario",
  () => {
    return function MockMenuUsuario() {
      return <div>Menu Usuario Mock</div>;
    };
  }
);

describe("Navbar", () => {
  it("muestra el titulo del sitio", () => {
    render(<Navbar />);

    expect(
      screen.getByText(tituloPagina)
    ).toBeInTheDocument();
  });

  it("muestra el enlace Inicio", () => {
    render(<Navbar />);

    const enlace = screen.getByRole("link", {
      name: "Inicio",
    });

    expect(enlace).toHaveAttribute(
      "href",
      "/publicaciones"
    );
  });

  it("muestra el enlace Explorar publicaciones", () => {
    render(<Navbar />);

    const enlace = screen.getByRole("link", {
      name: "Explorar publicaciones",
    });

    expect(enlace).toHaveAttribute(
      "href",
      "/publicaciones"
    );
  });

  it("muestra el enlace Preguntas Frecuentes", () => {
    render(<Navbar />);

    const enlace = screen.getByRole("link", {
      name: "Preguntas Frecuentes",
    });

    expect(enlace).toHaveAttribute(
      "href",
      "/ayuda"
    );
  });

  it("renderiza MenuUsuario", () => {
    render(<Navbar />);

    expect(
      screen.getByText("Menu Usuario Mock")
    ).toBeInTheDocument();
  });
});