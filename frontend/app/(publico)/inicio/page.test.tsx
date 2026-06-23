import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("HomePage", () => {
  it("renderiza el contenido principal y los accesos", () => {
    render(<HomePage />);

    expect(
      screen.getByRole("heading", {
        name: /plataforma de donaciones/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: /iniciar sesión/i,
      })
    ).toHaveAttribute("href", "/login");

    expect(
      screen.getByRole("link", {
        name: /¿cómo funciona\?/i,
      })
    ).toHaveAttribute("href", "/como_funciona");
  });
});