jest.mock("next/server", () => {
  const { MockNextResponse } = require("../../../test/nextServerMock");
  return { NextResponse: MockNextResponse };
});

import { GET, POST } from "./route";

describe("GET /api/publicaciones", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reenvía la respuesta del backend", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => JSON.stringify([{ id: "1", titulo: "Mesa" }]),
      headers: { get: () => "application/json" },
    });

    const response = await GET();

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/publicaciones"),
      expect.objectContaining({ cache: "no-store" }),
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual([{ id: "1", titulo: "Mesa" }]);
  });

  it("retorna 503 si el backend no responde", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error());

    const response = await GET();

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      message:
        "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
    });
  });
});

describe("POST /api/publicaciones", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 401 si falta el token", async () => {
    const request = {
      headers: { get: jest.fn().mockReturnValue(null) },
      json: jest.fn(),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      message: "Token de autenticación faltante.",
    });
  });

  it("retorna 400 si el cuerpo es inválido", async () => {
    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
      json: jest.fn().mockRejectedValue(new Error()),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Cuerpo inválido." });
  });

  it("reenvía la creación al backend", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 201,
      text: async () => JSON.stringify({ id: "nueva" }),
      headers: { get: () => "application/json" },
    });

    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
      json: jest.fn().mockResolvedValue({ titulo: "Silla" }),
    } as unknown as Request;

    const response = await POST(request);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/publicaciones"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(response.status).toBe(201);
  });

  it("retorna 503 si el backend no responde", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error());

    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
      json: jest.fn().mockResolvedValue({ titulo: "Silla" }),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(503);
  });
});
