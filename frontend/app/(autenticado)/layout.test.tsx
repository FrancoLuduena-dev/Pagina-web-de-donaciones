import { render, screen } from "@testing-library/react";
import LayoutAutenticado from "./layout";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

describe("LayoutAutenticado", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza los children cuando existe token", async () => {
    Storage.prototype.getItem = jest.fn(() => "token-falso");

    render(
      <LayoutAutenticado>
        <div data-testid="contenido">
          Contenido protegido
        </div>
      </LayoutAutenticado>,
    );

    expect(
      await screen.findByTestId("contenido")
    ).toBeInTheDocument();

    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("no renderiza los children cuando no existe token", () => {
    Storage.prototype.getItem = jest.fn(() => null);

    render(
      <LayoutAutenticado>
        <div data-testid="contenido">
          Contenido protegido
        </div>
      </LayoutAutenticado>,
    );

    expect(
      screen.queryByTestId("contenido")
    ).not.toBeInTheDocument();
  });

  it("redirige a login cuando no existe token", () => {
    Storage.prototype.getItem = jest.fn(() => null);

    render(
      <LayoutAutenticado>
        <div>Contenido protegido</div>
      </LayoutAutenticado>,
    );

    expect(replaceMock).toHaveBeenCalledWith("/login");
  });
});