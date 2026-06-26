import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import SolicitudesPage from "./page";

describe("SolicitudesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    Storage.prototype.getItem = jest.fn().mockReturnValue("token");

    global.alert = jest.fn();
  });

  it("muestra error cuando falla la carga inicial", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
    });

    render(<SolicitudesPage />);

    expect(
      await screen.findByText("No se pudieron cargar las solicitudes."),
    ).toBeInTheDocument();
  });

  it("muestra mensajes vacíos cuando no hay solicitudes", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<SolicitudesPage />);

    expect(
      await screen.findByText("No realizaste solicitudes."),
    ).toBeInTheDocument();

    expect(
      screen.getByText("Ninguna de tus publicaciones tiene solicitudes."),
    ).toBeInTheDocument();
  });

  it("renderiza solicitudes pendientes", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "1",
            publicacionId: "10",
            estado: "PENDIENTE",
            mensaje: "Necesito esta mesa",
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
            publicacion: {
              id: "10",
              titulo: "Mesa",
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "2",
            publicacionId: "20",
            estado: "PENDIENTE",
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
            publicacion: {
              id: "20",
              titulo: "Silla",
            },
          },
        ],
      });

    render(<SolicitudesPage />);

    expect(await screen.findByText("Mesa")).toBeInTheDocument();

    expect(screen.getByText("Silla")).toBeInTheDocument();

    expect(screen.getByText("Necesito esta mesa")).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /cancelar solicitud/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: /aceptar/i,
      }),
    ).toBeInTheDocument();
  });

  it("permite cancelar una solicitud", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "1",
            publicacionId: "10",
            estado: "PENDIENTE",
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
            publicacion: {
              id: "10",
              titulo: "Mesa",
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    render(<SolicitudesPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: /cancelar solicitud/i,
      }),
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/solicitudes/1/cancelar",
        expect.objectContaining({
          method: "PATCH",
        }),
      );
    });
  });

  it("permite aceptar una solicitud", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "2",
            publicacionId: "20",
            estado: "PENDIENTE",
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
            publicacion: {
              id: "20",
              titulo: "Silla",
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    render(<SolicitudesPage />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: /aceptar/i,
      }),
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/solicitudes/2/aceptar",
        expect.objectContaining({
          method: "PATCH",
        }),
      );
    });
  });

  it("permite rechazar una solicitud con motivo", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "2",
            publicacionId: "20",
            estado: "PENDIENTE",
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
            publicacion: {
              id: "20",
              titulo: "Silla",
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    render(<SolicitudesPage />);

    fireEvent.change(await screen.findByPlaceholderText(/motivo de rechazo/i), {
      target: {
        value: "Ya fue entregado",
      },
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: /rechazar/i,
      }),
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/solicitudes/2/rechazar",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({
            motivo: "Ya fue entregado",
          }),
        }),
      );
    });
  });

  it("muestra datos de contacto cuando una solicitud fue aceptada", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "1",
            publicacionId: "10",
            estado: "ACEPTADA",
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
            publicacion: {
              id: "10",
              titulo: "Mesa",
            },
            creadorPublicacion: {
              id: "u1",
              nombre: "Juan",
              email: "juan@test.com",
              telefono: "123",
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<SolicitudesPage />);

    expect(await screen.findByText("Juan")).toBeInTheDocument();

    expect(screen.getByText("juan@test.com")).toBeInTheDocument();

    expect(screen.getByText("123")).toBeInTheDocument();
  });

  it("muestra motivo de rechazo", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "1",
            publicacionId: "10",
            estado: "RECHAZADA",
            motivoRechazo: "Objeto reservado",
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
            publicacion: {
              id: "10",
              titulo: "Mesa",
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<SolicitudesPage />);

    expect(await screen.findByText(/objeto reservado/i)).toBeInTheDocument();
  });

  it("muestra mensaje por defecto cuando no hay motivo de rechazo", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "1",
            publicacionId: "10",
            estado: "RECHAZADA",
            motivoRechazo: "   ",
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
            publicacion: {
              id: "10",
              titulo: "Mesa",
            },
          },
        ],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

    render(<SolicitudesPage />);

    expect(
      await screen.findByText("No se dio motivo de rechazo."),
    ).toBeInTheDocument();
  });
  it("deshabilita aceptar cuando la publicación ya tiene otra solicitud aceptada", async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            id: "1",
            publicacionId: "10",
            estado: "ACEPTADA",
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
            publicacion: {
              id: "10",
              titulo: "Mesa",
            },
          },
          {
            id: "2",
            publicacionId: "10",
            estado: "PENDIENTE",
            createdAt: "2025-01-01T00:00:00Z",
            updatedAt: "2025-01-01T00:00:00Z",
            publicacion: {
              id: "10",
              titulo: "Mesa",
            },
          },
        ],
      });

    render(<SolicitudesPage />);

    const boton = await screen.findByRole("button", {
      name: /Solicitud ya reservada/i,
    });

    expect(boton).toBeDisabled();
  });
});
