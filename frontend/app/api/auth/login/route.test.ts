import { POST } from "./route"; // Ajusta la ruta a tu archivo real
import { NextResponse } from "next/server";

// 1. Mockeamos NextResponse para facilitar las aserciones
jest.mock("next/server", () => ({
    NextResponse: class {
        body: any;
        status: number | undefined;

        constructor(body: any, init?: { status?: number }) {
            this.body = body;
            this.status = init?.status || 200;
        }

        static json(body: any, init?: { status?: number }) {
            return { body, status: init?.status || 200 };
        }
    },
}));

// 2. Mockeamos la función global fetch
global.fetch = jest.fn();

describe("POST API Route - Login", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Debería retornar 400 si el JSON del body es inválido", async () => {
        const mockRequest = {
            json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
        } as unknown as Request;

        const response = await POST(mockRequest);

        // @ts-ignore
        expect(response.status).toBe(400);
        // @ts-ignore
        expect(response.body).toEqual({ message: "Cuerpo inválido." });
    });

    it("Debería retornar 503 si el fetch al backend falla (error de red)", async () => {
        const mockRequest = {
            json: jest.fn().mockResolvedValue({ email: "test@test.com", password: "123" }),
        } as unknown as Request;

        (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Error"));

        const response = await POST(mockRequest);

        // @ts-ignore
        expect(response.status).toBe(503);
        // @ts-ignore
        expect(response.body).toEqual({
            message: "No se pudo conectar con el servidor.",
        });
    });

    it("Debería retornar el error exacto del backend si este envía un 'message'", async () => {
        const mockRequest = {
            json: jest.fn().mockResolvedValue({ email: "test@test.com", password: "123" }),
        } as unknown as Request;

        const mockBackendResponse = {
            ok: false,
            status: 403,
            json: jest.fn().mockResolvedValue({ message: "Usuario bloqueado." }),
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockBackendResponse);

        const response = await POST(mockRequest);

        // @ts-ignore
        expect(response.status).toBe(403);
        // @ts-ignore
        expect(response.body).toEqual({ message: "Usuario bloqueado." });
    });

    it("Debería retornar un error 401 genérico si el backend responde 401 sin mensaje", async () => {
        const mockRequest = {
            json: jest.fn().mockResolvedValue({ email: "test@test.com", password: "123" }),
        } as unknown as Request;

        const mockBackendResponse = {
            ok: false,
            status: 401,
            json: jest.fn().mockResolvedValue({}), // Sin mensaje
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockBackendResponse);

        const response = await POST(mockRequest);

        // @ts-ignore
        expect(response.status).toBe(401);
        // @ts-ignore
        expect(response.body).toEqual({ message: "Correo o contraseña incorrectos." });
    });

    it("Debería retornar un error genérico con el status si falla y no es 401 ni trae mensaje", async () => {
        const mockRequest = {
            json: jest.fn().mockResolvedValue({ email: "test@test.com", password: "123" }),
        } as unknown as Request;

        const mockBackendResponse = {
            ok: false,
            status: 500,
            json: jest.fn().mockResolvedValue({}), // Sin mensaje
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockBackendResponse);

        const response = await POST(mockRequest);

        // @ts-ignore
        expect(response.status).toBe(500);
        // @ts-ignore
        expect(response.body).toEqual({ message: "Error al iniciar sesión (500)." });
    });

    it("Debería hacer fetch al backend y retornar el accessToken en caso de éxito", async () => {
        const mockBody = { email: "test@test.com", password: "123" };
        const mockRequest = {
            json: jest.fn().mockResolvedValue(mockBody),
        } as unknown as Request;

        // Simulamos respuesta exitosa
        const mockBackendResponse = {
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({ accessToken: "eyJh..." }),
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockBackendResponse);

        const response = await POST(mockRequest);

        // Verificamos que llamó a fetch correctamente
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:3000/usuario/login",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(mockBody),
            }
        );

        // @ts-ignore
        expect(response.status).toBe(200);
        // @ts-ignore
        expect(response.body).toEqual({ accessToken: "eyJh..." });
    });
});