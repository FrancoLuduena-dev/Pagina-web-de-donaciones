// 1. MOCKEAR next/server ANTES de importar
jest.mock("next/server", () => ({
    NextResponse: class {
        body: any;
        status: number;
        headers: any;

        constructor(body: any, init?: { status?: number; headers?: any }) {
            this.body = body;
            this.status = init?.status || 200;
            this.headers = init?.headers || {};
        }

        static json(body: any, init?: { status?: number }) {
            return {
                body,
                status: init?.status || 200,
            };
        }
    },
}));

import { POST } from "./route";

global.fetch = jest.fn();

describe("POST /api/auth/register", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("400 si body inválido", async () => {
        const req = {
            json: jest.fn().mockRejectedValue(new Error("invalid")),
        } as any;

        const res = await POST(req);

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ message: "Cuerpo inválido." });
    });

    it("proxy OK", async () => {
        const body = { nombre: "Franco" };

        const req = {
            json: jest.fn().mockResolvedValue(body),
        } as any;

        (fetch as jest.Mock).mockResolvedValue({
            status: 201,
            text: jest.fn().mockResolvedValue(JSON.stringify({ ok: true })),
            headers: {
                get: jest.fn().mockReturnValue("application/json"),
            },
        });

        const res = await POST(req);

        expect(res.status).toBe(201);
        expect(res.body).toBe(JSON.stringify({ ok: true }));
    });

    it("503 si falla fetch", async () => {
        const req = {
            json: jest.fn().mockResolvedValue({}),
        } as any;

        (fetch as jest.Mock).mockRejectedValue(new Error("network"));

        const res = await POST(req);

        expect(res.status).toBe(503);
        expect(res.body).toEqual({
            message: "No se pudo conectar con el servidor.",
        });
    });
});