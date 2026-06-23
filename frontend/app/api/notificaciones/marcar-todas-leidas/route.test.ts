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

import { PATCH } from "./route";

describe(
  "PATCH /api/notificaciones/marcar-todas-leidas",
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
            text: async () => "OK",
          });

        const request = {
          headers: {
            get: jest.fn().mockReturnValue(
              "Bearer token",
            ),
          },
        } as unknown as Request;

        const response =
          await PATCH(request);

        expect(
          global.fetch,
        ).toHaveBeenCalledWith(
          expect.stringContaining(
            "/notificaciones/marcar-todas-leidas",
          ),
          expect.objectContaining({
            method: "PATCH",
          }),
        );

        expect(response.status).toBe(
          200,
        );
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
          await PATCH(request);

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