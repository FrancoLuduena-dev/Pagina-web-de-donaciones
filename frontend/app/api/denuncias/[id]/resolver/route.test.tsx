jest.mock("next/server", () => ({
  NextResponse: {
    json: (
      body: unknown,
      init?: { status?: number },
    ) => ({
      status:
        init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

import { PATCH } from "./route";

describe(
  "PATCH /api/denuncias/[id]/resolver",
  () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it(
      "retorna 401 si falta el token",
      async () => {
        const request = {
          headers: {
            get: jest
              .fn()
              .mockReturnValue(null),
          },
        } as unknown as Request;

        const response =
          await PATCH(
            request,
            {
              params:
                Promise.resolve({
                  id: "1",
                }),
            },
          );

        expect(
          response.status,
        ).toBe(401);

        expect(
          await response.json(),
        ).toEqual({
          message:
            "Token de autenticación faltante.",
        });
      },
    );

    it(
      "retorna 400 si el cuerpo es inválido",
      async () => {
        const request = {
          headers: {
            get: jest
              .fn()
              .mockReturnValue(
                "Bearer token",
              ),
          },
          json: jest
            .fn()
            .mockRejectedValue(
              new Error(),
            ),
        } as unknown as Request;

        const response =
          await PATCH(
            request,
            {
              params:
                Promise.resolve({
                  id: "1",
                }),
            },
          );

        expect(
          response.status,
        ).toBe(400);

        expect(
          await response.json(),
        ).toEqual({
          message:
            "Cuerpo inválido.",
        });
      },
    );

    it(
      "retorna 503 si el backend no responde",
      async () => {
        global.fetch = jest
          .fn()
          .mockRejectedValue(
            new Error(),
          );

        const request = {
          headers: {
            get: jest
              .fn()
              .mockReturnValue(
                "Bearer token",
              ),
          },
          json: jest
            .fn()
            .mockResolvedValue({
              version: 1,
              tipoResolucion:
                "DESCARTADA",
              detalleResolucion:
                "Detalle de prueba suficientemente largo",
            }),
        } as unknown as Request;

        const response =
          await PATCH(
            request,
            {
              params:
                Promise.resolve({
                  id: "1",
                }),
            },
          );

        expect(
          response.status,
        ).toBe(503);

        expect(
          await response.json(),
        ).toEqual({
          message:
            "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
        });
      },
    );
  },
);