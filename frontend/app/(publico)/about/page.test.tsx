import { render, screen } from "@testing-library/react";
import SobreNosotrosPage from "./page";
import { tituloPagina } from "@/constants/site";

describe("SobreNosotrosPage", () => {
  it("renderiza el título principal", () => {
    render(<SobreNosotrosPage />);

    expect(
      screen.getByRole("heading", {
        name: /sobre nosotros/i,
      })
    ).toBeInTheDocument();
  });

  it("muestra el nombre de la aplicación", () => {
    render(<SobreNosotrosPage />);

    expect(screen.getByText(new RegExp(tituloPagina, "i"))).toBeInTheDocument();
  });

  it("muestra las secciones principales", () => {
    render(<SobreNosotrosPage />);

    expect(
      screen.getByRole("heading", {
        name: /nuestra misión/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /sobre el proyecto/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: /nuestro compromiso/i,
      })
    ).toBeInTheDocument();
  });
});