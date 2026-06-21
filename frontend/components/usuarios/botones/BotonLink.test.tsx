import { render, screen } from "@testing-library/react";
import BotonLink from "./BotonLink";

describe("BotonLink", () => {
  it("renderiza correctamente", () => {
    render(
      <BotonLink
        href="/publicaciones"
        texto="Ver publicaciones"
      />
    );

    const link = screen.getByRole("link", {
      name: "Ver publicaciones",
    });

    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "/publicaciones"
    );
  });
});