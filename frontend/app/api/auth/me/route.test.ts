import { GET } from "./route";

// Mock de fetch global
global.fetch = jest.fn();

// Mock de NextResponse
jest.mock("next/server", () => ({
    NextResponse: {
        json: (body: any, init?: { status?: number }) => ({
            body,
            status: init?.status,
        }),
    },
}));

describe("GET /usuario/mi proxy", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("devuelve la respuesta del backend correctamente (JSON válido)", async () => {
        (fetch as jest.Mock).mockResolvedValue({
            status: 200,
            text: jest.fn().mockResolvedValue(
                JSON.stringify({ id: 1, nombre: "Fran" })
            ),
        });

        const req = {
            headers: new Headers({
                authorization: "Bearer token",
            }),
        } as any;

        const res = await GET(req);

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining("/usuario/mi"),
            expect.objectContaining({
                headers: { Authorization: "Bearer token" },
                cache: "no-store",
            })
        );

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ id: 1, nombre: "Fran" });
    });

    it("maneja respuesta no JSON del backend", async () => {
        (fetch as jest.Mock).mockResolvedValue({
            status: 400,
            text: jest.fn().mockResolvedValue("Error plano"),
        });

        const req = {
            headers: new Headers(),
        } as any;

        const res = await GET(req);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({
            message: "Error plano",
        });
    });

    it("maneja respuesta vacía del backend", async () => {
        (fetch as jest.Mock).mockResolvedValue({
            status: 500,
            text: jest.fn().mockResolvedValue(""),
        });

        const req = {
            headers: new Headers(),
        } as any;

        const res = await GET(req);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({
            message: "Error al obtener el usuario.",
        });
    });

    it("retorna 503 si falla el fetch (backend caído)", async () => {
        (fetch as jest.Mock).mockRejectedValue(new Error("network error"));

        const req = {
            headers: new Headers(),
        } as any;

        const res = await GET(req);

        expect(res.status).toBe(503);
        expect(res.body).toEqual({
            message: "No se pudo conectar con el backend.",
        });
    });
});