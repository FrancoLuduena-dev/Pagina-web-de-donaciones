import { render, screen } from "@testing-library/react";
import TarjetaResumen from "./TarjetaResumen";

describe("TarjetaResumen", () => {
  it("renderiza el título y el valor", () => {
    render(
      <TarjetaResumen
        titulo="Publicaciones"
        valor={10}
      />
    );

    expect(
      screen.getByText("Publicaciones")
    ).toBeInTheDocument();

    expect(
      screen.getByText("10")
    ).toBeInTheDocument();
  });
});