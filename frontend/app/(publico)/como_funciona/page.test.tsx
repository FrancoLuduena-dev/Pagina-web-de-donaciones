import { render, screen } from "@testing-library/react";
import ComoFuncionaPage from "./page";

describe("ComoFuncionaPage", () => {
  it("renderiza la información de funcionamiento", () => {
    render(<ComoFuncionaPage />);

    expect(
      screen.getByText(
        /nuestra plataforma permite que cualquier persona/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /los usuarios pueden explorar distintas publicaciones/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /cada publicación incluye información relevante/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /el objetivo es crear una comunidad solidaria/i
      )
    ).toBeInTheDocument();
  });
});