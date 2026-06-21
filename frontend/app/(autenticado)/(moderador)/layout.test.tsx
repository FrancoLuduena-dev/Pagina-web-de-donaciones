import { render, screen } from "@testing-library/react";
import PublicoLayout from "./layout";

jest.mock(
  "@/components/layout/navbar/Navbar",
  () => ({
    __esModule: true,
    default: () => (
      <div data-testid="navbar">
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

describe("ModeracionLayout", () => {
  it("renderiza navbar, footer y children", () => {
    render(
      <PublicoLayout>
        <div data-testid="contenido">
          Contenido
        </div>
      </PublicoLayout>
    );

    expect(
      screen.getByTestId("navbar")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("footer")
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("contenido")
    ).toBeInTheDocument();
  });
});