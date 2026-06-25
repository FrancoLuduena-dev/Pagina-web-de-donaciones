import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import SolicitarPublicacionButton from "./SolicitarPublicacionButton";

const refreshMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: refreshMock,
  }),
}));

jest.mock("@/lib/solicitudes", () => ({
  ESTADOS_SOLICITUD_ACTIVA: ["PENDIENTE", "ACEPTADA"],
  crearSolicitudRequest: jest.fn(),
  listarMisSolicitudesRequest: jest.fn(),
}));

import {
  crearSolicitudRequest,
  listarMisSolicitudesRequest,
} from "@/lib/solicitudes";

const CREADOR_ID = "22222222-2222-4222-8222-222222222222";
const PUBLICACION_ID = "11111111-1111-4111-8111-111111111111";

describe("SolicitarPublicacionButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Storage.prototype.getItem = jest.fn(() => "token-falso");
  });

  it("no se muestra al creador ni en publicaciones no disponibles", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: CREADOR_ID }),
      }),
    ) as jest.Mock;

    const { container: creador } = render(
      <SolicitarPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="DISPONIBLE"
      />,
    );

    await waitFor(() => {
      expect(creador).toBeEmptyDOMElement();
    });

    const { container: reservada } = render(
      <SolicitarPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="RESERVADA"
      />,
    );

    expect(reservada).toBeEmptyDOMElement();
  });

  it("muestra link a login sin sesión", async () => {
    Storage.prototype.getItem = jest.fn(() => null);

    render(
      <SolicitarPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="DISPONIBLE"
      />,
    );

    expect(
      await screen.findByRole("link", { name: "Iniciá sesión para solicitar" }),
    ).toHaveAttribute("href", "/login");
  });

  it("envía una solicitud correctamente", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: "33333333-3333-4333-8333-333333333333" }),
      }),
    ) as jest.Mock;
    (listarMisSolicitudesRequest as jest.Mock).mockResolvedValue([]);
    (crearSolicitudRequest as jest.Mock).mockResolvedValue({ id: "sol-1" });

    render(
      <SolicitarPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="DISPONIBLE"
      />,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Solicitar publicación" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Confirmar solicitud" }),
    );

    await waitFor(() => {
      expect(crearSolicitudRequest).toHaveBeenCalledWith({
        publicacionId: PUBLICACION_ID,
        mensaje: undefined,
      });
      expect(refreshMock).toHaveBeenCalled();
    });

    expect(screen.getByText("¡Solicitud enviada!")).toBeInTheDocument();
  });

  it("indica cuando ya hay una solicitud activa", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: "33333333-3333-4333-8333-333333333333" }),
      }),
    ) as jest.Mock;
    (listarMisSolicitudesRequest as jest.Mock).mockResolvedValue([
      {
        publicacionId: PUBLICACION_ID,
        estado: "PENDIENTE",
      },
    ]);

    render(
      <SolicitarPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="DISPONIBLE"
      />,
    );

    expect(
      await screen.findByText("Ya tenés una solicitud activa."),
    ).toBeInTheDocument();
  });
});
