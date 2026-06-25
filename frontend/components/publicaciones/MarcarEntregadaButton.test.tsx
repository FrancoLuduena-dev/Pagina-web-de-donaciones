import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import MarcarEntregadaButton from "./MarcarEntregadaButton";

const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

jest.mock("@/lib/solicitudes", () => ({
  entregarPublicacionRequest: jest.fn(),
}));

import { entregarPublicacionRequest } from "@/lib/solicitudes";

const CREADOR_ID = "22222222-2222-4222-8222-222222222222";
const PUBLICACION_ID = "11111111-1111-4111-8111-111111111111";

describe("MarcarEntregadaButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn(() => "token-falso");
    window.confirm = jest.fn(() => true);
  });

  it("marca como entregada cuando el creador confirma", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: CREADOR_ID }),
      }),
    ) as jest.Mock;

    render(
      <MarcarEntregadaButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="RESERVADA"
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Marcar como entregada" }),
    );

    await waitFor(() => {
      expect(entregarPublicacionRequest).toHaveBeenCalledWith(PUBLICACION_ID);
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("no se muestra si la publicación no está reservada", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: CREADOR_ID }),
      }),
    ) as jest.Mock;

    const { container } = render(
      <MarcarEntregadaButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="DISPONIBLE"
      />,
    );

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it("no ejecuta la acción si el usuario cancela", async () => {
    window.confirm = jest.fn(() => false);

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: CREADOR_ID }),
      }),
    ) as jest.Mock;

    render(
      <MarcarEntregadaButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="RESERVADA"
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Marcar como entregada" }),
    );

    expect(entregarPublicacionRequest).not.toHaveBeenCalled();
  });
});
