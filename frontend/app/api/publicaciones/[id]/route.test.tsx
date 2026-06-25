jest.mock("next/server", () => {
  const { MockNextResponse } = require("../../../../test/nextServerMock");
  return { NextResponse: MockNextResponse };
});

import { DELETE, GET, PATCH } from "./route";

const context = {
  params: Promise.resolve({ id: "pub-1" }),
};

describe("GET /api/publicaciones/[id]", () => {
  it("reenvía la respuesta del backend", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify({ id: "pub-1", titulo: "Mesa" }),
      headers: { get: () => "application/json" },
    });

    const response = await GET({} as Request, context);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/publicaciones/pub-1"),
      expect.any(Object),
    );
    expect(response.status).toBe(200);
  });

  it("retorna 503 si el backend no responde", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error());

    const response = await GET({} as Request, context);

    expect(response.status).toBe(503);
  });
});

describe("PATCH /api/publicaciones/[id]", () => {
  it("retorna 401 sin token", async () => {
    const request = {
      headers: { get: jest.fn().mockReturnValue(null) },
      json: jest.fn(),
    } as unknown as Request;

    const response = await PATCH(request, context);

    expect(response.status).toBe(401);
  });

  it("retorna 400 con cuerpo inválido", async () => {
    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
      json: jest.fn().mockRejectedValue(new Error()),
    } as unknown as Request;

    const response = await PATCH(request, context);

    expect(response.status).toBe(400);
  });

  it("reenvía la edición al backend", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify({ id: "pub-1" }),
      headers: { get: () => "application/json" },
    });

    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
      json: jest.fn().mockResolvedValue({ titulo: "Mesa editada" }),
    } as unknown as Request;

    const response = await PATCH(request, context);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/publicaciones/pub-1"),
      expect.objectContaining({ method: "PATCH" }),
    );
    expect(response.status).toBe(200);
  });

  it("retorna 503 si el backend no responde", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error());

    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
      json: jest.fn().mockResolvedValue({ titulo: "Mesa editada" }),
    } as unknown as Request;

    const response = await PATCH(request, context);

    expect(response.status).toBe(503);
  });
});

describe("DELETE /api/publicaciones/[id]", () => {
  it("retorna 401 sin token", async () => {
    const request = {
      headers: { get: jest.fn().mockReturnValue(null) },
    } as unknown as Request;

    const response = await DELETE(request, context);

    expect(response.status).toBe(401);
  });

  it("reenvía la eliminación al backend", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => "",
      headers: { get: () => "application/json" },
    });

    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
    } as unknown as Request;

    const response = await DELETE(request, context);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/publicaciones/pub-1/eliminar"),
      expect.objectContaining({ method: "DELETE" }),
    );
    expect(response.status).toBe(200);
  });

  it("retorna 503 si el backend no responde", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error());

    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
    } as unknown as Request;

    const response = await DELETE(request, context);

    expect(response.status).toBe(503);
  });
});
