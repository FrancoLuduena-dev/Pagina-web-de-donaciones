jest.mock("next/server", () => {
  const { MockNextResponse } = require("../../../../test/nextServerMock");
  return { NextResponse: MockNextResponse };
});

import { GET } from "./route";

describe("GET /api/publicaciones/mias", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reenvía la lista con token y filtro de estado", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [{ id: "1", titulo: "Mesa" }],
    });

    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
      url: "http://localhost/api/publicaciones/mias?estado=DISPONIBLE",
    } as unknown as Request;

    const response = await GET(request);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/publicaciones/mias?estado=DISPONIBLE"),
      expect.objectContaining({
        headers: { Authorization: "Bearer token" },
      }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ id: "1", titulo: "Mesa" }]);
  });

  it("consulta sin filtro cuando no hay estado", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [],
    });

    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
      url: "http://localhost/api/publicaciones/mias",
    } as unknown as Request;

    await GET(request);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/publicaciones/mias"),
      expect.any(Object),
    );
    expect(String((global.fetch as jest.Mock).mock.calls[0][0])).not.toContain(
      "?estado=",
    );
  });

  it("retorna 503 si el backend no responde", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error());

    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
      url: "http://localhost/api/publicaciones/mias",
    } as unknown as Request;

    const response = await GET(request);

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      message: "No se pudo conectar con el backend.",
    });
  });
});
