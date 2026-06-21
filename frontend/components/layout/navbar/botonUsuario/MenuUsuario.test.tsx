import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import MenuUsuario from "./MenuUsuario";
import { RolUsuario } from "@/types/RolUsuario";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const mockFetchUsuario = (rol: RolUsuario) => {
  global.fetch = jest.fn((url) => {
    if (String(url).includes("/api/auth/me")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: "1",
          nombreUsuario: "Juan",
          correo: "juan@test.com",
          rol,
        }),
      });
    }

    if (String(url).includes("/api/solicitudes/recibidas")) {
      return Promise.resolve({
        ok: true,
        json: async () => [],
      });
    }

    return Promise.reject(new Error("Ruta no mockeada"));
  }) as jest.Mock;
};

describe("MenuUsuario", () => {

  beforeEach(() => {
  jest.clearAllMocks();

  Storage.prototype.getItem = jest.fn(() => "token-falso");

  jest.spyOn(global, "setInterval")
    .mockImplementation(() => 1 as any);

  jest.spyOn(global, "clearInterval")
    .mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

  it("muestra las opciones de usuario normal", async () => {
    mockFetchUsuario(RolUsuario.usuarioNormal);

    render(<MenuUsuario />);

    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button"));

    expect(
      screen.getByText("Panel de usuario")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Mis publicaciones")
    ).toBeInTheDocument();

    expect(
      screen.getByText("Mis Solicitudes")
    ).toBeInTheDocument();

    expect(
      screen.queryByText("Denuncias")
    ).not.toBeInTheDocument();

    expect(
      screen.queryByText("Gestión de roles de usuario")
    ).not.toBeInTheDocument();
  });

  it("muestra las opciones de moderador", async () => {
    mockFetchUsuario(RolUsuario.usuarioModerador);

    render(<MenuUsuario />);

    await waitFor(() => {
      expect(screen.getByText("Juan")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button"));

    expect(
      screen.getByText("Denuncias")
    ).toBeInTheDocument();

  expect(
    screen.queryByText("Panel de usuario")
  ).not.toBeInTheDocument();

  expect(
    screen.queryByText("Gestión de roles de usuario")
  ).not.toBeInTheDocument();
});

});