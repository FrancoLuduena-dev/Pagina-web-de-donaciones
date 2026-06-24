import { render, screen, waitFor } from "@testing-library/react";

import EditarPublicacionLink from "./EditarPublicacionLink";

const CREADOR_ID = "22222222-2222-4222-8222-222222222222";
const PUBLICACION_ID = "11111111-1111-4111-8111-111111111111";

describe("EditarPublicacionLink", () => {
  beforeEach(() => {
    Storage.prototype.getItem = jest.fn(() => "token-falso");
  });

  it("muestra el enlace al creador en estado editable", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: CREADOR_ID }),
      }),
    ) as jest.Mock;

    render(
      <EditarPublicacionLink
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="DISPONIBLE"
      />,
    );

    const link = await screen.findByRole("link", {
      name: "Editar publicación",
    });

    expect(link).toHaveAttribute(
      "href",
      `/publicaciones/publicacion/${PUBLICACION_ID}/editar`,
    );
  });

  it("no se muestra si el usuario no es el creador", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: "otro-usuario" }),
      }),
    ) as jest.Mock;

    const { container } = render(
      <EditarPublicacionLink
        idPublicacion={PUBLICACION_ID}
        creadorId={CREADOR_ID}
        estadoPublicacion="DISPONIBLE"
      />,
    );

    await waitFor(() => {
      expect(container).toBeEmptyDOMElement();
    });
  });

  it("no se muestra en publicación reservada", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ id: CREADOR_ID }),
      }),
    ) as jest.Mock;

    const { container } = render(
      <EditarPublicacionLink
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
