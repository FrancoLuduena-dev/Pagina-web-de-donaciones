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

describe(
  "GET /api/notificaciones/no-leidas/cantidad",
  () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it(
      "reenvía correctamente la solicitud al backend",
      async () => {
        global.fetch = jest
          .fn()
          .mockResolvedValue({
            status: 200,
            json: async () => ({
              cantidad: 5,
            }),
          });

        const request = {
          headers: {
            get: jest.fn().mockReturnValue(
              "Bearer token",
            ),
          },
        } as unknown as Request;

        const response =
          await GET(request);

        expect(
          global.fetch,
        ).toHaveBeenCalledWith(
          expect.stringContaining(
            "/notificaciones/no-leidas/cantidad",
          ),
          expect.objectContaining({
            cache: "no-store",
          }),
        );

        expect(response.status).toBe(
          200,
        );

        expect(
          await response.json(),
        ).toEqual({
          cantidad: 5,
        });
      },
    );

    it(
      "retorna 503 cuando falla el backend",
      async () => {
        global.fetch = jest
          .fn()
          .mockRejectedValue(
            new Error(),
          );

        const request = {
          headers: {
            get: jest.fn().mockReturnValue(
              "Bearer token",
            ),
          },
        } as unknown as Request;

        const response =
          await GET(request);

        expect(response.status).toBe(
          503,
        );

        expect(
          await response.json(),
        ).toEqual({
          message:
            "No se pudo conectar con el backend.",
        });
      },
    );
  },
);