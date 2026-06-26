import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import DenunciarPublicacionButton from "./DenunciarPublicacionButton";

jest.mock("@/lib/auth", () => ({
  obtenerUsuarioActualRequest: jest.fn(),
}));

jest.mock("@/lib/denuncias", () => ({
  crearDenunciaRequest: jest.fn(),
}));

import { obtenerUsuarioActualRequest } from "@/lib/auth";
import { crearDenunciaRequest } from "@/lib/denuncias";

const CREADOR_ID = "22222222-2222-4222-8222-222222222222";
const PUBLICACION_ID = "11111111-1111-4111-8111-111111111111";

describe("DenunciarPublicacionButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("no se muestra al creador de la publicación", async () => {
    (obtenerUsuarioActualRequest as jest.Mock).mockResolvedValue({
      id: CREADOR_ID,
      nombreUsuario: "owner",
      correo: "owner@test.com",
      rol: "usuarioNormal",
    });

    const { container } = render(
      <DenunciarPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
      />,
    );

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it("muestra link a login sin sesión", async () => {
    (obtenerUsuarioActualRequest as jest.Mock).mockResolvedValue(null);

    render(
      <DenunciarPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
      />,
    );

    expect(
      await screen.findByRole("link", { name: "Iniciá sesión para denunciar" }),
    ).toHaveAttribute("href", "/login");
  });

  it("envía una denuncia correctamente", async () => {
    (obtenerUsuarioActualRequest as jest.Mock).mockResolvedValue({
      id: "33333333-3333-4333-8333-333333333333",
      nombreUsuario: "juan",
      correo: "juan@test.com",
      rol: "usuarioNormal",
    });
    (crearDenunciaRequest as jest.Mock).mockResolvedValue({ id: "den-1" });

    render(
      <DenunciarPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Denunciar" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Enviar denuncia" }),
    );

    await waitFor(() => {
      expect(crearDenunciaRequest).toHaveBeenCalledWith({
        publicacionId: PUBLICACION_ID,
        motivo: "CONTENIDO_INAPROPIADO",
        comentario: undefined,
      });
    });

    expect(
      screen.getByText("Denuncia enviada. Un moderador la revisará."),
    ).toBeInTheDocument();
  });

  it("valida comentario obligatorio para motivo OTRO", async () => {
    (obtenerUsuarioActualRequest as jest.Mock).mockResolvedValue({
      id: "33333333-3333-4333-8333-333333333333",
      nombreUsuario: "juan",
      correo: "juan@test.com",
      rol: "usuarioNormal",
    });

    render(
      <DenunciarPublicacionButton
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
      />,
    );

    fireEvent.click(await screen.findByRole("button", { name: "Denunciar" }));
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "OTRO" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Enviar denuncia" }),
    );

    expect(
      await screen.findByText(
        /Para “Otro motivo” tenés que explicar la situación/,
      ),
    ).toBeInTheDocument();
    expect(crearDenunciaRequest).not.toHaveBeenCalled();
  });
});
