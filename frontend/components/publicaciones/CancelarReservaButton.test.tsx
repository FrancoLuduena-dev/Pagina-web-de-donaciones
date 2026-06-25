import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import CancelarReservaButton from "./CancelarReservaButton";

const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

jest.mock("@/lib/solicitudes", () => ({
  cancelarReservaPublicacionRequest: jest.fn(),
}));

import { cancelarReservaPublicacionRequest } from "@/lib/solicitudes";

const CREADOR_ID = "22222222-2222-4222-8222-222222222222";
const PUBLICACION_ID = "11111111-1111-4111-8111-111111111111";

describe("CancelarReservaButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn(() => "token-falso");
    window.confirm = jest.fn(() => true);
  });

  it("cancela la reserva cuando el creador confirma", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: CREADOR_ID }),
      }),
    ) as jest.Mock;

    render(
      <CancelarReservaButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="RESERVADA"
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Cancelar reserva" }),
    );

    await waitFor(() => {
      expect(cancelarReservaPublicacionRequest).toHaveBeenCalledWith(
        PUBLICACION_ID,
      );
      expect(refreshMock).toHaveBeenCalled();
    });
  });

  it("no se muestra para usuarios que no son el creador", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: "otro-usuario" }),
      }),
    ) as jest.Mock;

    const { container } = render(
      <CancelarReservaButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="RESERVADA"
      />,
    );

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });
});
