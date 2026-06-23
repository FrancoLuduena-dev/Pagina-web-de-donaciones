import { render, screen } from "@testing-library/react";
import UnloggedNavbar from "./UnloggedNavbar";
import { tituloPagina } from "@/constants/site";

describe("UnloggedNavbar", () => {
  it("muestra el titulo del sitio", () => {
    render(<UnloggedNavbar />);

    expect(
      screen.getByText(tituloPagina)
    ).toBeInTheDocument();
  });

  it("muestra el enlace al inicio", () => {
    render(<UnloggedNavbar />);

    const enlace = screen.getByRole("link", {
      name: tituloPagina,
    });

    expect(enlace).toHaveAttribute("href", "/");
  });

  it("muestra el enlace Iniciar Sesión", () => {
    render(<UnloggedNavbar />);

    const enlace = screen.getByRole("link", {
      name: "Iniciar Sesión",
    });

    expect(enlace).toHaveAttribute(
      "href",
      "/login"
    );
  });

  it("muestra el enlace Registrarse", () => {
    render(<UnloggedNavbar />);

    const enlace = screen.getByRole("link", {
      name: "Registrarse",
    });

    expect(enlace).toHaveAttribute(
      "href",
      "/register"
    );
  });
});