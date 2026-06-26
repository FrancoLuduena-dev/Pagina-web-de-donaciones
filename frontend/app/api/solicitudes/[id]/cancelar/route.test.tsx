import { PATCH } from "./route";
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

describe("PATCH /api/solicitudes/[id]/cancelar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reenvía correctamente la solicitud al backend", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      text: async () => "OK",
    });

    const request = {
      headers: {
        get: jest.fn().mockReturnValue(
          "Bearer token"
        ),
      },
      json: jest.fn().mockResolvedValue({
        motivo: "",
      }),
    } as unknown as Request;

    const response = await PATCH(
      request,
      {
        params: Promise.resolve({
          id: "123",
        }),
      }
    );

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/solicitudes/123/cancelar"
      ),
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          motivo: "",
        }),
      })
    );

    expect(response.status).toBe(200);
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
      json: jest.fn().mockResolvedValue({
        motivo: "",
      }),
    } as unknown as Request;

    const response = await PATCH(
      request,
      {
        params: Promise.resolve({
          id: "123",
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