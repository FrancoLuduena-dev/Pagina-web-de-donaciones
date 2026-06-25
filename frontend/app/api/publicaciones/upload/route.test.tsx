jest.mock("next/server", () => {
  const { MockNextResponse } = require("../../../../test/nextServerMock");
  return { NextResponse: MockNextResponse };
});

import { POST } from "./route";

function crearRequestConImagenes(cantidad: number, conToken = true) {
  const imagenes = Array.from({ length: cantidad }, (_, index) => {
    const file = new File(["img"], `foto-${index}.jpg`, { type: "image/jpeg" });
    return file;
  });

  const formData = new FormData();
  imagenes.forEach((imagen) => formData.append("imagenes", imagen));

  return {
    headers: {
      get: jest
        .fn()
        .mockReturnValue(conToken ? "Bearer token" : null),
    },
    formData: jest.fn().mockResolvedValue(formData),
  } as unknown as Request;
}

describe("POST /api/publicaciones/upload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna 401 sin token", async () => {
    const response = await POST(crearRequestConImagenes(1, false));

    expect(response.status).toBe(401);
  });

  it("retorna 400 si el formulario es inválido", async () => {
    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
      formData: jest.fn().mockRejectedValue(new Error()),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ message: "Formulario inválido." });
  });

  it("retorna 400 si no hay imágenes", async () => {
    const request = {
      headers: { get: jest.fn().mockReturnValue("Bearer token") },
      formData: jest.fn().mockResolvedValue(new FormData()),
    } as unknown as Request;

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "No se recibió ninguna imagen.",
    });
  });

  it("retorna 400 si supera el máximo de imágenes", async () => {
    const response = await POST(crearRequestConImagenes(6));

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      message: "Podés subir hasta 5 imágenes.",
    });
  });

  it("reenvía el upload al backend", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 201,
      text: async () =>
        JSON.stringify({ imagenUrls: ["http://localhost/uploads/a.jpg"] }),
      headers: { get: () => "application/json" },
    });

    const response = await POST(crearRequestConImagenes(2));

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/publicaciones/upload"),
      expect.objectContaining({ method: "POST" }),
    );
    expect(response.status).toBe(201);
  });

  it("retorna 503 si el backend no responde", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error());

    const response = await POST(crearRequestConImagenes(1));

    expect(response.status).toBe(503);
  });
});
