import { render, screen } from "@testing-library/react";
import PublicoLayout from "./layout";

jest.mock(
  "@/components/layout/sidebar/Sidebar",
  () => function MockSidebar() {
    return <div data-testid="sidebar" />;
  },
);

jest.mock(
  "@/components/publicaciones/searchbar/Searchbar",
  () => function MockSearchbar() {
    return <div data-testid="searchbar" />;
  },
);

describe("PublicoLayout", () => {
  it("renderiza la estructura del layout", () => {
    render(
      <PublicoLayout>
        <div data-testid="contenido">
          Contenido de prueba
        </div>
      </PublicoLayout>,
    );

    expect(
      screen.getByTestId("sidebar"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("searchbar"),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId("contenido"),
    ).toBeInTheDocument();
  });
});