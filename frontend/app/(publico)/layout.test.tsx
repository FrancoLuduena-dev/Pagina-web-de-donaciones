import { render, screen } from "@testing-library/react";
import PublicoLayout from "./layout";

jest.mock(
  "@/components/layout/navbar/UnloggedNavbar",
  () => ({
    __esModule: true,
    default: () => (
      <div data-testid="unlogged-navbar">
        Navbar
      </div>
    ),
  }),
);

jest.mock(
  "@/components/layout/footer/Footer",
  () => ({
    __esModule: true,
    default: () => (
      <div data-testid="footer">
        Footer
      </div>
    ),
  }),
);

describe("PublicoLayout", () => {
  it("renderiza navbar, footer y children", () => {
    render(
      <PublicoLayout>
        <div data-testid="contenido">
          Contenido de prueba
        </div>
      </PublicoLayout>
    );

    expect(
      screen.getByTestId("unlogged-navbar")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("footer")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("contenido")
    ).toBeInTheDocument();
  });
});