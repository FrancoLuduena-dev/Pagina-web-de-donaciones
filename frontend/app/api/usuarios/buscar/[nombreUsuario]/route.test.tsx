jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

import { GET } from "./route";

describe("GET /api/usuario/nombre/[nombreUsuario]", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("obtiene el usuario desde el backend", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => ({
        id: "1",
        nombreUsuario: "juan",
      }),
    });

    const request = {
      headers: {
        get: jest.fn().mockReturnValue(
          "Bearer token"
        ),
      },
    } as unknown as Request;

    const response = await GET(
      request,
      {
        params: Promise.resolve({
          nombreUsuario: "juan",
        }),
      }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/usuario/nombre/juan"
      ),
      expect.objectContaining({
        headers: {
          Authorization: "Bearer token",
        },
      })
    );

    expect(response.status).toBe(200);

    expect(await response.json()).toEqual({
      id: "1",
      nombreUsuario: "juan",
    });
  });

  it("retorna 503 cuando falla el backend", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error());

    const request = {
      headers: {
        get: jest.fn().mockReturnValue(
          "Bearer token"
        ),
      },
    } as unknown as Request;

    const response = await GET(
      request,
      {
        params: Promise.resolve({
          nombreUsuario: "juan",
        }),
      }
    );

    expect(response.status).toBe(503);

    expect(await response.json()).toEqual({
      message:
        "No se pudo conectar con el backend.",
    });
  });
});