import {
    loginRequest,
    registerRequest,
    resetPasswordRequest,
    editarPerfilRequest,
    persistSession,
    clearSession,
    getAccessToken,
    obtenerUsuarioActualRequest,
} from "./auth"; // Ajusta el import a tu archivo real

// Mock global de fetch
global.fetch = jest.fn();

describe("Servicios Frontend API", () => {
    // Setup: Mock de localStorage
    let setItemSpy: jest.SpyInstance;
    let getItemSpy: jest.SpyInstance;
    let removeItemSpy: jest.SpyInstance;

    beforeEach(() => {
        jest.clearAllMocks();
        // Espiamos los métodos reales de localStorage en JSDOM
        setItemSpy = jest.spyOn(Storage.prototype, "setItem");
        getItemSpy = jest.spyOn(Storage.prototype, "getItem");
        removeItemSpy = jest.spyOn(Storage.prototype, "removeItem");
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    // --- LOGIN ---
    describe("loginRequest", () => {
        it("Debería retornar datos y guardar el token si es exitoso", async () => {
            const mockResponse = { accessToken: "token123", user: { id: 1 } };
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const res = await loginRequest({ correo: "test", contrasenia: "123" });

            expect(res).toEqual(mockResponse);
            expect(setItemSpy).toHaveBeenCalledWith("access_token", "token123");
        });

        it("Debería lanzar error si el backend retorna 401", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 401,
                json: jest.fn().mockResolvedValue({}),
            });

            await expect(loginRequest({ correo: "test", contrasenia: "123" })).rejects.toThrow(
                "Correo o contraseña incorrectos."
            );
            expect(setItemSpy).not.toHaveBeenCalled(); // No guarda token
        });

        it("Debería lanzar error si la respuesta no es un JSON válido", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
            });

            await expect(loginRequest({ correo: "test", contrasenia: "123" })).rejects.toThrow(
                "Respuesta inválida del servidor."
            );
        });
    });

    // --- REGISTER ---
    describe("registerRequest", () => {
        it("Debería retornar los datos si es exitoso", async () => {
            const mockResponse = { message: "Exito" };
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue(mockResponse),
            });

            const res = await registerRequest({
                correo: "test",
                contrasenia: "123",
                nombreUsuario: "test",
                nombreCompleto: "Test User",
                numeroTelefono: "12345678",
            });

            expect(res).toEqual(mockResponse);
        });

        it("Debería lanzar error genérico con fallback si la respuesta JSON falla y no es ok", async () => {
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 500,
                json: jest.fn().mockRejectedValue(new Error("No JSON")),
            });

            await expect(
                registerRequest({ correo: "a", contrasenia: "b", nombreUsuario: "c", nombreCompleto: "d", numeroTelefono: "e" })
            ).rejects.toThrow("Error al intentar registrar la cuenta.");
        });
    });

    // --- PASSWORD RESET & EDITAR PERFIL ---
    describe("Peticiones autenticadas (Password Reset & Editar Perfil)", () => {
        it("resetPasswordRequest debería enviar el token en el header Authorization", async () => {
            getItemSpy.mockReturnValue("token-activo-123");
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                json: jest.fn().mockResolvedValue({ message: "Éxito" }),
            });

            await resetPasswordRequest({ contraseniaActual: "123", contraseniaNueva: "456" });

            expect(global.fetch).toHaveBeenCalledWith("/api/auth/passwordReset", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer token-activo-123",
                },
                body: JSON.stringify({ contraseniaActual: "123", contraseniaNueva: "456" }),
            });
        });

        it("editarPerfilRequest debería manejar error 401 lanzando mensaje correcto", async () => {
            getItemSpy.mockReturnValue("token-activo-123");
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 401,
                json: jest.fn().mockResolvedValue({}),
            });

            await expect(editarPerfilRequest({ nombreUsuario: "nuevo" })).rejects.toThrow(
                "Los datos del perfil son inválidos."
            );
        });
    });

    // --- MANEJO DE SESIÓN ---
    describe("Funciones de Sesión (localStorage)", () => {
        it("persistSession debería guardar el token", () => {
            persistSession({ accessToken: "mi-token", user: { id: 1, correo: "", rol: "" } });
            expect(setItemSpy).toHaveBeenCalledWith("access_token", "mi-token");
        });

        it("clearSession debería remover el token", () => {
            clearSession();
            expect(removeItemSpy).toHaveBeenCalledWith("access_token");
        });

        it("getAccessToken debería retornar el token almacenado", () => {
            getItemSpy.mockReturnValue("token-recuperado");
            const token = getAccessToken();
            expect(getItemSpy).toHaveBeenCalledWith("access_token");
            expect(token).toBe("token-recuperado");
        });
    });

    // --- OBTENER USUARIO ACTUAL ---
    describe("obtenerUsuarioActualRequest", () => {
        it("Debería retornar null si no hay token en localStorage", async () => {
            getItemSpy.mockReturnValue(null);
            const res = await obtenerUsuarioActualRequest();

            expect(res).toBeNull();
            expect(global.fetch).not.toHaveBeenCalled();
        });

        it("Debería limpiar la sesión y retornar null si el backend retorna 401", async () => {
            getItemSpy.mockReturnValue("token-invalido");
            (global.fetch as jest.Mock).mockResolvedValue({
                ok: false,
                status: 401,
            });

            const res = await obtenerUsuarioActualRequest();

            expect(removeItemSpy).toHaveBeenCalledWith("access_token");
            expect(res).toBeNull();
        });

        it("Debería retornar el usuario si la petición es exitosa", async () => {
            getItemSpy.mockReturnValue("token-valido");
            const mockUser = { id: "1", correo: "a@a.com", nombreUsuario: "test", rol: "user" };

            (global.fetch as jest.Mock).mockResolvedValue({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue(mockUser),
            });

            const res = await obtenerUsuarioActualRequest();

            expect(res).toEqual(mockUser);
        });

        it("Debería retornar null en caso de error de red o catch", async () => {
            getItemSpy.mockReturnValue("token-valido");
            (global.fetch as jest.Mock).mockRejectedValue(new Error("Network Error"));

            const res = await obtenerUsuarioActualRequest();

            expect(res).toBeNull();
        });
    });
});