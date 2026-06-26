jest.mock("next/server", () => ({
  NextResponse: class {
    status: number;
    body: unknown;

    constructor(
      body?: unknown,
      init?: { status?: number }
    ) {
      this.body = body;
      this.status = init?.status ?? 200;
    }

    async json() {
      return this.body;
    }

    static json(
      body: unknown,
      init?: { status?: number }
    ) {
      return {
        status: init?.status ?? 200,
        json: async () => body,
      };
    }
  },
}));

import { PATCH } from "./route";

describe("PATCH /api/publicacion/[publicacionId]/cancelar-reserva", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 401 si falta el token", async () => {
    const request = {
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
    } as unknown as Request;

    const response = await PATCH(request, {
      params: Promise.resolve({
        publicacionId: "1",
      }),
    });

    expect(response.status).toBe(401);

    expect(await response.json()).toEqual({
      message: "Token de autenticación faltante.",
    });
  });

  it("reenvía correctamente la petición al backend", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => "OK",
      headers: {
        get: jest.fn().mockReturnValue(
          "application/json",
        ),
      },
    });

    const request = {
      headers: {
        get: jest.fn().mockReturnValue(
          "Bearer token",
        ),
      },
      json: jest.fn().mockResolvedValue({
        motivo: "Reserva cancelada",
      }),
    } as unknown as Request;

    const response = await PATCH(request, {
      params: Promise.resolve({
        publicacionId: "1",
      }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/solicitudes/publicacion/1/cancelar-reserva",
      ),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          motivo: "Reserva cancelada",
        }),
      }),
    );

    expect(response.status).toBe(200);
  });

  it("continúa aunque el body sea inválido", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => "OK",
      headers: {
        get: jest.fn().mockReturnValue(
          "application/json",
        ),
      },
    });

    const request = {
      headers: {
        get: jest.fn().mockReturnValue(
          "Bearer token",
        ),
      },
      json: jest.fn().mockRejectedValue(
        new Error(),
      ),
    } as unknown as Request;

    await PATCH(request, {
      params: Promise.resolve({
        publicacionId: "1",
      }),
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        body: JSON.stringify({}),
      }),
    );
  });

  it("retorna 503 cuando falla el backend", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error());

    const request = {
      headers: {
        get: jest.fn().mockReturnValue(
          "Bearer token",
        ),
      },
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Request;

    const response = await PATCH(request, {
      params: Promise.resolve({
        publicacionId: "1",
      }),
    });

    expect(response.status).toBe(503);

    expect(await response.json()).toEqual({
      message:
        "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
    });
  });
});