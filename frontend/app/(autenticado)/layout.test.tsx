import { render, screen, waitFor } from "@testing-library/react";

import LayoutAutenticado from "./layout";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

jest.mock("@/lib/auth", () => ({
  obtenerUsuarioActualRequest: jest.fn(),
  getAccessToken: jest.fn(),
}));

import { getAccessToken, obtenerUsuarioActualRequest } from "@/lib/auth";

describe("LayoutAutenticado", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza los children cuando existe sesión válida", async () => {
    (obtenerUsuarioActualRequest as jest.Mock).mockResolvedValue({
      id: "user-1",
      nombreUsuario: "juan",
      correo: "juan@test.com",
      rol: "usuarioNormal",
    });

    render(
      <LayoutAutenticado>
        <div data-testid="contenido">Contenido protegido</div>
      </LayoutAutenticado>,
    );

    expect(await screen.findByTestId("contenido")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("no renderiza los children mientras verifica la sesión", () => {
    (obtenerUsuarioActualRequest as jest.Mock).mockReturnValue(
      new Promise(() => undefined),
    );

    render(
      <LayoutAutenticado>
        <div data-testid="contenido">Contenido protegido</div>
      </LayoutAutenticado>,
    );

    expect(screen.queryByTestId("contenido")).not.toBeInTheDocument();
  });

  it("redirige a login cuando no hay token", async () => {
    (obtenerUsuarioActualRequest as jest.Mock).mockResolvedValue(null);
    (getAccessToken as jest.Mock).mockReturnValue(null);

    render(
      <LayoutAutenticado>
        <div>Contenido protegido</div>
      </LayoutAutenticado>,
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login");
    });
  });

  it("mantiene acceso si hay token pero el backend no responde", async () => {
    (obtenerUsuarioActualRequest as jest.Mock).mockResolvedValue(null);
    (getAccessToken as jest.Mock).mockReturnValue("token-falso");

    render(
      <LayoutAutenticado>
        <div data-testid="contenido">Contenido protegido</div>
      </LayoutAutenticado>,
    );

    expect(await screen.findByTestId("contenido")).toBeInTheDocument();
    expect(replaceMock).not.toHaveBeenCalled();
  });
});
