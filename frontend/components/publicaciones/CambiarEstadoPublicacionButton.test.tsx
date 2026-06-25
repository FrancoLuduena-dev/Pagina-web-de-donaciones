import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import CambiarEstadoPublicacionButton from "./CambiarEstadoPublicacionButton";
import { RolUsuario } from "@/types/RolUsuario";

const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

jest.mock("@/lib/publicaciones", () => ({
  pausarPublicacionRequest: jest.fn(),
  reactivarPublicacionRequest: jest.fn(),
}));

import {
  pausarPublicacionRequest,
  reactivarPublicacionRequest,
} from "@/lib/publicaciones";

const CREADOR_ID = "22222222-2222-4222-8222-222222222222";
const PUBLICACION_ID = "11111111-1111-4111-8111-111111111111";

describe("CambiarEstadoPublicacionButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn(() => "token-falso");
    window.confirm = jest.fn(() => true);
  });

  it("muestra pausar al creador en publicación disponible", async () => {
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
      <CambiarEstadoPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="DISPONIBLE"
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Pausar publicación" }),
    );

    await waitFor(() => {
      expect(pausarPublicacionRequest).toHaveBeenCalledWith(PUBLICACION_ID);
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("muestra bloquear al moderador en publicación ajena", async () => {
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
      <CambiarEstadoPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="DISPONIBLE"
      />,
    );

    expect(
      await screen.findByRole("button", { name: "Bloquear publicación" }),
    ).toBeInTheDocument();
  });

  it("reactiva una publicación pausada", async () => {
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
      <CambiarEstadoPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="PAUSADA"
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Reactivar publicación" }),
    );

    await waitFor(() => {
      expect(reactivarPublicacionRequest).toHaveBeenCalledWith(PUBLICACION_ID);
    });
  });

  it("no se muestra si el usuario no tiene permisos", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({
          id: "99999999-9999-4999-8999-999999999999",
          rol: RolUsuario.usuarioNormal,
        }),
      }),
    ) as jest.Mock;

    const { container } = render(
      <CambiarEstadoPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="DISPONIBLE"
      />,
    );

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
