import { render, screen } from "@testing-library/react";
import RootLayout from "./layout";

describe("RootLayout", () => {
  it("renderiza el contenido recibido", () => {
    render(
      <RootLayout>
        <div data-testid="contenido">
          Contenido de prueba
        </div>
      </RootLayout>
    );

    expect(
      screen.getByTestId("contenido")
    ).toBeInTheDocument();
  });
});