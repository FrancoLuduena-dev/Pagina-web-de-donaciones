jest.mock("next/server", () => {
  const { MockNextResponse } = require("../../../../../test/nextServerMock");
  return { NextResponse: MockNextResponse };
});

import { PATCH } from "./route";

describe("PATCH /api/publicaciones/[id]/reactivar", () => {
  const context = { params: Promise.resolve({ id: "pub-1" }) };

  it("retorna 401 sin token", async () => {
    const request = {
      headers: { get: jest.fn().mockReturnValue(null) },
    } as unknown as Request;

    const response = await PATCH(request, context);

    expect(response.status).toBe(401);
  });

  it("reenvía la reactivación al backend", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify({ estado: "DISPONIBLE" }),
      headers: { get: () => "application/json" },
    });

    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
    } as unknown as Request;

    const response = await PATCH(request, context);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/publicaciones/pub-1/reactivar"),
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(response.status).toBe(200);
  });

  it("retorna 503 si el backend no responde", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error());

    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
    } as unknown as Request;

    const response = await PATCH(request, context);

    expect(response.status).toBe(503);
  });
});
