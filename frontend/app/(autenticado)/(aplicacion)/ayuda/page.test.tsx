import { render, screen } from "@testing-library/react";
import AyudaPage from "./page";
import { tituloPagina } from "@/constants/site";

describe("AyudaPage", () => {
  it("renderiza el título de la página", () => {
    render(<AyudaPage />);

    expect(
      screen.getByRole("heading", {
        name: "Preguntas Frecuentes",
      })
    ).toBeInTheDocument();
  });

  it("renderiza la pregunta sobre la plataforma", () => {
    render(<AyudaPage />);

    expect(
      screen.getByText(`¿Qué es ${tituloPagina}?`)
    ).toBeInTheDocument();
  });

  it("renderiza respuestas frecuentes", () => {
    render(<AyudaPage />);

    expect(
      screen.getByText(
        /Publicar, solicitar y recibir donaciones es completamente gratuito/i
      )
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /Podés reportarla utilizando la opción Denunciar/i
      )
    ).toBeInTheDocument();
  });

  it("renderiza todas las preguntas frecuentes", () => {
    render(<AyudaPage />);

    const preguntas = screen.getAllByRole("heading", {
      level: 2,
    });

    expect(preguntas).toHaveLength(14);
  });
});