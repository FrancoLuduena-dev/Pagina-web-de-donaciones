jest.mock("next/server", () => ({
  NextResponse: class {
    status: number;
    headers: Record<string, string> | undefined;
    body: unknown;

    constructor(
      body: unknown,
      init?: {
        status?: number;
        headers?: Record<string, string>;
      },
    ) {
      this.body = body;
      this.status = init?.status ?? 200;
      this.headers = init?.headers;
    }

    static json(
      body: unknown,
      init?: { status?: number },
    ) {
      return {
        status: init?.status ?? 200,
        json: async () => body,
      };
    }
  },
}));

import { GET, POST } from "./route";

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

  it("obtiene las denuncias correctamente", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    status: 200,
    text: async () => '[{"id":"1"}]',
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
  } as unknown as Request;

  const response = await GET(request);

  expect(global.fetch).toHaveBeenCalledWith(
    expect.stringContaining("/denuncias"),
    expect.objectContaining({
      headers: {
        Authorization: "Bearer token",
      },
    }),
  );

  expect(response.status).toBe(200);
});

it("POST retorna 400 si el cuerpo es inválido", async () => {
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

  const response = await POST(request);

  expect(response.status).toBe(400);
});

it("POST crea una denuncia correctamente", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    status: 201,
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
      motivo: "Spam",
    }),
  } as unknown as Request;

  const response = await POST(request);

  expect(global.fetch).toHaveBeenCalled();

  expect(response.status).toBe(201);
});

it("POST retorna 503 cuando falla el backend", async () => {
  global.fetch = jest
    .fn()
    .mockRejectedValue(new Error());

  const request = {
    headers: {
      get: jest.fn().mockReturnValue(
        "Bearer token",
      ),
    },
    json: jest.fn().mockResolvedValue({
      motivo: "Spam",
    }),
  } as unknown as Request;

  const response = await POST(request);

  expect(response.status).toBe(503);

  expect(await response.json()).toEqual({
    message:
      "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
  });
});
});