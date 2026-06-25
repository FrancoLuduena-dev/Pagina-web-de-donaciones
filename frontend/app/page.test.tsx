import HomePage from "./page";
import { cookies } from "next/headers";
import * as navigation from "next/navigation";

const redirectMock = jest.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
});

jest.mock("next/headers", () => ({
    cookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
    redirect: (...args: unknown[]) => redirectMock(...args),
}));

jest.mock("next/server", () => ({
    NextResponse: class {
        status: number;
        body: unknown;

        constructor(
            body?: unknown,
            init?: {
                status?: number;
                headers?: Record<string, string>;
            },
        ) {
            this.body = body;
            this.status = init?.status ?? 200;
        }

        async json() {
            return this.body;
        }

        async text() {
            return String(this.body);
        }

        static json(
            body: unknown,
            init?: { status?: number },
        ) {
            return {
                status: init?.status ?? 200,
                json: async () => body,
            };
        }
    },
}));

describe("HomePage", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    it("redirige a /inicio si no existe token", async () => {
        (cookies as jest.Mock).mockResolvedValue({
            get: jest.fn().mockReturnValue(undefined),
        });

        await expect(HomePage()).rejects.toThrow("NEXT_REDIRECT:/inicio");

        expect(redirectMock).toHaveBeenCalledWith("/inicio");
    });

    it("redirige a /inicio si el token es inválido", async () => {
        (cookies as jest.Mock).mockResolvedValue({
            get: jest.fn().mockReturnValue({
                value: "token",
            }),
        });

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: false,
        });

        await expect(HomePage()).rejects.toThrow("NEXT_REDIRECT:/inicio");

        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:3000/usuario/me",
            expect.objectContaining({
                headers: {
                    Authorization: "Bearer token",
                },
            }),
        );

        expect(redirectMock).toHaveBeenCalledWith("/inicio");
    });

    it("redirige a /publicaciones si el token es válido", async () => {
        (cookies as jest.Mock).mockResolvedValue({
            get: jest.fn().mockReturnValue({
                value: "token",
            }),
        });

        (global.fetch as jest.Mock).mockResolvedValue({
            ok: true,
        });

        await expect(HomePage()).rejects.toThrow("NEXT_REDIRECT:/publicaciones");

        expect(global.fetch).toHaveBeenCalledWith(
            "http://localhost:3000/usuario/me",
            expect.objectContaining({
                headers: {
                    Authorization: "Bearer token",
                },
            }),
        );

        expect(redirectMock).toHaveBeenCalledWith("/publicaciones");
    });
});