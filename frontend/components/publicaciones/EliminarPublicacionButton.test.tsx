import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import EliminarPublicacionButton from "./EliminarPublicacionButton";
import { RolUsuario } from "@/types/RolUsuario";

const pushMock = jest.fn();
const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock,
  }),
}));

jest.mock("@/lib/publicaciones", () => ({
  eliminarPublicacionRequest: jest.fn(),
}));

import { eliminarPublicacionRequest } from "@/lib/publicaciones";

const CREADOR_ID = "22222222-2222-4222-8222-222222222222";
const PUBLICACION_ID = "11111111-1111-4111-8111-111111111111";

describe("EliminarPublicacionButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn(() => "token-falso");
    window.confirm = jest.fn(() => true);
  });

  it("permite eliminar al creador en publicación disponible", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          id: CREADOR_ID,
          rol: RolUsuario.usuarioNormal,
        }),
      }),
    ) as jest.Mock;

    render(
      <EliminarPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="DISPONIBLE"
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Eliminar publicación" }),
    );

    await waitFor(() => {
      expect(eliminarPublicacionRequest).toHaveBeenCalledWith(PUBLICACION_ID);
      expect(pushMock).toHaveBeenCalledWith("/publicaciones");
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("muestra acción de moderación para moderador", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          id: "33333333-3333-4333-8333-333333333333",
          rol: RolUsuario.usuarioModerador,
        }),
      }),
    ) as jest.Mock;

    render(
      <EliminarPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="RESERVADA"
      />,
    );

    expect(
      await screen.findByRole("button", { name: "Eliminar (moderación)" }),
    ).toBeInTheDocument();
  });

  it("no elimina si el usuario cancela la confirmación", async () => {
    window.confirm = jest.fn(() => false);

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          id: CREADOR_ID,
          rol: RolUsuario.usuarioNormal,
        }),
      }),
    ) as jest.Mock;

    render(
      <EliminarPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="DISPONIBLE"
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Eliminar publicación" }),
    );

    expect(eliminarPublicacionRequest).not.toHaveBeenCalled();
  });
});
