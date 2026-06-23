import { GET } from "./route";
jest.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));
describe("GET /api/solicitudes/mias", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("obtiene las solicitudes desde el backend", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: async () => [
        {
          id: "1",
          estado: "PENDIENTE",
        },
      ],
    });

    const request = {
      headers: {
        get: jest.fn().mockReturnValue(
          "Bearer token"
        ),
      },
    } as unknown as Request;

    const response = await GET(request);

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(
        "/solicitudes/mias"
      ),
      expect.objectContaining({
        cache: "no-store",
      })
    );

    expect(response.status).toBe(200);

    expect(await response.json()).toEqual([
      {
        id: "1",
        estado: "PENDIENTE",
      },
    ]);
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

    const response = await GET(request);

    expect(response.status).toBe(503);

    expect(await response.json()).toEqual({
      message:
        "No se pudo conectar con el backend.",
    });
  });
});