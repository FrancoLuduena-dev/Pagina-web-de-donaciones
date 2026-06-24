jest.mock("next/server", () => ({
  NextResponse: {
    json: (
      body: unknown,
      init?: { status?: number },
    ) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

import { GET } from "./route";

describe("GET /api/denuncias", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 401 si falta el token", async () => {
    const request = {
      headers: {
        get: jest.fn().mockReturnValue(null),
      },
    } as unknown as Request;

    const response = await GET(request);

    expect(response.status).toBe(401);

    expect(await response.json()).toEqual({
      message:
        "Token de autenticación faltante.",
    });
  });

  it("retorna 503 si el backend no responde", async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error());

    const request = {
      headers: {
        get: jest.fn().mockReturnValue(
          "Bearer token",
        ),
      },
    } as unknown as Request;

    const response = await GET(request);

    expect(response.status).toBe(503);

    expect(await response.json()).toEqual({
      message:
        "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
    });
  });
});