import { PATCH } from "./route"; // Asegúrate de ajustar esta ruta
import { NextResponse } from "next/server";

// 1. Mockeamos NextResponse
jest.mock("next/server", () => ({
    NextResponse: class {
        body: any;
        status: number | undefined;
        headers: any;

        constructor(body: any, init?: { status?: number; headers?: any }) {
            this.body = body;
            this.status = init?.status || 200;
            this.headers = init?.headers;
        }

        static json(body: any, init?: { status?: number }) {
            return { body, status: init?.status || 200 };
        }
    },
}));

// 2. Mockeamos fetch
global.fetch = jest.fn();

describe("PATCH API Route - Reset Password", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Debería retornar 400 si el JSON del body es inválido", async () => {
        const mockRequest = {
            json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
        } as unknown as Request;

        const response = await PATCH(mockRequest);

        // @ts-ignore
        expect(response.status).toBe(400);
        // @ts-ignore
        expect(response.body).toEqual({ message: "Cuerpo inválido." });
    });

    it("Debería retornar 500 si el fetch al backend falla por un error de red", async () => {
        const mockRequest = {
            json: jest.fn().mockResolvedValue({ nuevaPassword: "123" }),
            headers: { get: jest.fn().mockReturnValue(null) },
        } as unknown as Request;

        (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Error"));

        const response = await PATCH(mockRequest);

        // @ts-ignore
        expect(response.status).toBe(500);
        // @ts-ignore
        expect(response.body).toEqual({ message: "Error al intentar restablecer la contraseña." });
    });

    it("Debería retornar 500 si el backend responde con un status de error (!res.ok)", async () => {
        const mockRequest = {
            json: jest.fn().mockResolvedValue({ nuevaPassword: "123" }),
            headers: { get: jest.fn().mockReturnValue(null) },
        } as unknown as Request;

        // Simulamos que el backend falló internamente (ej. 400 Bad Request o 500)
        const mockBackendResponse = {
            ok: false,
            status: 400,
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockBackendResponse);

        const response = await PATCH(mockRequest);

        // Como tú lanzas un throw en el código original, cae en el catch y devuelve 500
        // @ts-ignore
        expect(response.status).toBe(500);
        // @ts-ignore
        expect(response.body).toEqual({ message: "Error al intentar restablecer la contraseña." });
    });

    it("Debería hacer fetch CON el header Authorization si viene en el request", async () => {
        const mockBody = { nuevaPassword: "123" };
        const mockRequest = {
            json: jest.fn().mockResolvedValue(mockBody),
            headers: { get: jest.fn().mockReturnValue("Bearer m-token-123") },
        } as unknown as Request;

        const mockBackendResponse = {
            ok: true,
            status: 200,
            text: jest.fn().mockResolvedValue("Contraseña restablecida"),
            headers: { get: jest.fn().mockReturnValue("text/plain") },
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockBackendResponse);

        const response = await PATCH(mockRequest);

        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:3000/usuario/resetearContrasenia",
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer m-token-123", // Verificamos que se incluye
                },
                body: JSON.stringify(mockBody),
            }
        );

        // @ts-ignore
        expect(response.status).toBe(200);
        // @ts-ignore
        expect(response.body).toBe("Contraseña restablecida");
    });

    it("Debería hacer fetch SIN el header Authorization si no viene en el request", async () => {
        const mockBody = { nuevaPassword: "123" };
        const mockRequest = {
            json: jest.fn().mockResolvedValue(mockBody),
            headers: { get: jest.fn().mockReturnValue(null) }, // Sin token
        } as unknown as Request;

        const mockBackendResponse = {
            ok: true,
            status: 200,
            text: jest.fn().mockResolvedValue(JSON.stringify({ msg: "Éxito" })),
            headers: { get: jest.fn().mockReturnValue(null) }, // Sin content-type para forzar el fallback
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockBackendResponse);

        const response = await PATCH(mockRequest);

        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:3000/usuario/resetearContrasenia",
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    // Verificamos explícitamente que NO está Authorization en los headers
                },
                body: JSON.stringify(mockBody),
            }
        );

        // @ts-ignore
        expect(response.status).toBe(200);
        // @ts-ignore
        expect(response.headers).toEqual({ "Content-Type": "application/json" }); // Test del fallback de Content-Type
    });
});