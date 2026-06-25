import { PATCH } from "./route"; // Ajusta la ruta a tu archivo real
import { NextResponse } from "next/server";

// 1. Mockeamos NextResponse para inspeccionar sus retornos fácilmente
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

// 2. Mockeamos la función global fetch
global.fetch = jest.fn();

describe("PATCH API Route", () => {
    // Limpiamos los mocks antes de cada test para que no interfieran entre sí
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Debería retornar 400 si el JSON del body es inválido", async () => {
        // Simulamos un request donde .json() lanza un error
        const mockRequest = {
            json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
        } as unknown as Request;

        const response = await PATCH(mockRequest);

        // @ts-ignore - Usamos ts-ignore porque response es un mock de NextResponse
        expect(response.status).toBe(400);
        // @ts-ignore
        expect(response.body).toEqual({ message: "Cuerpo inválido." });
    });

    it("Debería retornar 401 si falta el token de autorización", async () => {
        // Simulamos un body válido pero sin header de Authorization
        const mockRequest = {
            json: jest.fn().mockResolvedValue({ nombre: "Juan" }),
            headers: {
                get: jest.fn().mockReturnValue(null), // No hay token
            },
        } as unknown as Request;

        const response = await PATCH(mockRequest);

        // @ts-ignore
        expect(response.status).toBe(401);
        // @ts-ignore
        expect(response.body).toEqual({ message: "Token de autenticación faltante." });
    });

    it("Debería retornar 503 si el fetch al backend falla (error de red)", async () => {
        const mockRequest = {
            json: jest.fn().mockResolvedValue({ nombre: "Juan" }),
            headers: {
                get: jest.fn().mockReturnValue("Bearer token-secreto-123"),
            },
        } as unknown as Request;

        // Simulamos que el servidor backend está caído y fetch lanza un error
        (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Error"));

        const response = await PATCH(mockRequest);

        // @ts-ignore
        expect(response.status).toBe(503);
        // @ts-ignore
        expect(response.body).toEqual({
            message: "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
        });
    });

    it("Debería hacer fetch al backend y retornar la respuesta si todo es correcto", async () => {
        const mockBody = { nombre: "Juan" };
        const mockRequest = {
            json: jest.fn().mockResolvedValue(mockBody),
            headers: {
                get: jest.fn().mockReturnValue("Bearer token-secreto-123"),
            },
        } as unknown as Request;

        // Simulamos una respuesta exitosa del backend
        const mockBackendResponse = {
            status: 200,
            text: jest.fn().mockResolvedValue("Usuario actualizado con éxito"),
            headers: {
                get: jest.fn().mockReturnValue("text/plain"),
            },
        };
        (global.fetch as jest.Mock).mockResolvedValue(mockBackendResponse);

        const response = await PATCH(mockRequest);

        // 1. Verificamos que fetch haya sido llamado con la URL y parámetros correctos
        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:3000/usuario/actualizarUsuario",
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer token-secreto-123", // Verifica que arma bien el header
                },
                body: JSON.stringify(mockBody),
            }
        );

        // 2. Verificamos que la respuesta final tenga los datos que vinieron del backend
        // @ts-ignore
        expect(response.status).toBe(200);
        // @ts-ignore
        expect(response.body).toBe("Usuario actualizado con éxito");
        // @ts-ignore
        expect(response.headers).toEqual({ "Content-Type": "text/plain" });
    });
});