import { render, screen, waitFor } from "@testing-library/react";

import LayoutModerador from "./layout";

import {
  getAccessToken,
  obtenerUsuarioActualRequest,
} from "@/lib/auth";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
}));

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

jest.mock("@/lib/auth", () => ({
  getAccessToken: jest.fn(),
  obtenerUsuarioActualRequest: jest.fn(),
}));

describe("LayoutModerador", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza el contenido para moderador", async () => {
    (
      obtenerUsuarioActualRequest as jest.Mock
    ).mockResolvedValue({
      rol: "usuarioModerador",
    });

    render(
      <LayoutModerador>
        <div data-testid="contenido">
          Contenido
        </div>
      </LayoutModerador>,
    );

    expect(
      await screen.findByTestId(
        "contenido",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        "navbar",
      ),
    ).toBeInTheDocument();

    expect(
      screen.getByTestId(
        "footer",
      ),
    ).toBeInTheDocument();

    expect(
      replaceMock,
    ).not.toHaveBeenCalled();
  });

  it("renderiza el contenido para administrador", async () => {
    (
      obtenerUsuarioActualRequest as jest.Mock
    ).mockResolvedValue({
      rol:
        "usuarioAdministrador",
    });

    render(
      <LayoutModerador>
        <div data-testid="contenido">
          Contenido
        </div>
      </LayoutModerador>,
    );

    expect(
      await screen.findByTestId(
        "contenido",
      ),
    ).toBeInTheDocument();
  });

  it("redirige a login cuando no existe usuario ni token", async () => {
    (
      obtenerUsuarioActualRequest as jest.Mock
    ).mockResolvedValue(null);

    (
      getAccessToken as jest.Mock
    ).mockReturnValue(null);

    render(
      <LayoutModerador>
        <div>Contenido</div>
      </LayoutModerador>,
    );

    await waitFor(() => {
      expect(
        replaceMock,
      ).toHaveBeenCalledWith(
        "/login",
      );
    });
  });

  it("redirige a publicaciones cuando el usuario no tiene permisos", async () => {
    (
      obtenerUsuarioActualRequest as jest.Mock
    ).mockResolvedValue({
      rol: "usuarioNormal",
    });

    render(
      <LayoutModerador>
        <div>Contenido</div>
      </LayoutModerador>,
    );

    await waitFor(() => {
      expect(
        replaceMock,
      ).toHaveBeenCalledWith(
        "/publicaciones",
      );
    });
  });

  it("redirige a publicaciones cuando ocurre un error", async () => {
    (
      obtenerUsuarioActualRequest as jest.Mock
    ).mockRejectedValue(
      new Error("Error"),
    );

    render(
      <LayoutModerador>
        <div>Contenido</div>
      </LayoutModerador>,
    );

    await waitFor(() => {
      expect(
        replaceMock,
      ).toHaveBeenCalledWith(
        "/publicaciones",
      );
    });
  });
});