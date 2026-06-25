import { render, screen } from "@testing-library/react";

import RemoteImage from "@/components/RemoteImage";

describe("RemoteImage", () => {
  it("renderiza una imagen con src y alt", () => {
    render(<RemoteImage src="http://localhost/foto.jpg" alt="Una foto" />);

    const img = screen.getByRole("img", { name: "Una foto" });
    expect(img).toHaveAttribute("src", "http://localhost/foto.jpg");
  });

  it("usa loading lazy por defecto", () => {
    render(<RemoteImage src="http://localhost/foto.jpg" alt="Una foto" />);

    expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");
  });

  it("aplica width, height, className y loading en modo normal", () => {
    render(
      <RemoteImage
        src="http://localhost/foto.jpg"
        alt="Una foto"
        className="clase-imagen"
        width={120}
        height={80}
        loading="eager"
      />,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("width", "120");
    expect(img).toHaveAttribute("height", "80");
    expect(img).toHaveAttribute("loading", "eager");
    expect(img).toHaveClass("clase-imagen");
  });

  it("en modo fill aplica estilos de relleno e ignora width/height", () => {
    render(
      <RemoteImage
        src="http://localhost/foto.jpg"
        alt="Una foto"
        fill
        width={120}
        height={80}
      />,
    );

    const img = screen.getByRole("img");
    expect(img).toHaveStyle({ position: "absolute" });
    expect(img).toHaveStyle({ objectFit: "cover" });
    expect(img).toHaveStyle({ width: "100%" });
    expect(img).toHaveStyle({ height: "100%" });
    expect(img).not.toHaveAttribute("width");
    expect(img).not.toHaveAttribute("height");
  });
});
