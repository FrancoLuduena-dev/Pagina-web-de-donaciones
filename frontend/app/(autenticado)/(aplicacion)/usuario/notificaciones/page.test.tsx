import {
    fireEvent,
    render,
    screen,
    waitFor,
} from "@testing-library/react";

import NotificacionesPage from "./page";

describe("NotificacionesPage", () => {
    beforeEach(() => {
        jest.clearAllMocks();

        Storage.prototype.getItem =
            jest.fn().mockReturnValue(
                "token",
            );

        global.alert = jest.fn();
    });

    it("muestra error cuando falla la carga inicial", async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValue({
                ok: false,
            });

        render(<NotificacionesPage />);

        expect(
            await screen.findByText(
                "No se pudieron cargar las notificaciones.",
            ),
        ).toBeInTheDocument();
    });

    it("muestra mensaje vacío cuando no hay notificaciones", async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValue({
                ok: true,
                json: async () => ({
                    notificaciones: [],
                }),
            });

        render(<NotificacionesPage />);

        expect(
            await screen.findByText(
                "No tienes notificaciones.",
            ),
        ).toBeInTheDocument();
    });

    it("renderiza notificaciones", async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValue({
                ok: true,
                json: async () => ({
                    notificaciones: [
                        {
                            id: "1",
                            tipo: "SOLICITUD_ACEPTADA",
                            titulo:
                                "Solicitud aceptada",
                            mensaje:
                                "Tu solicitud fue aceptada.",
                            leida: false,
                            publicacionId: "10",
                            creadaEn:
                                "2025-01-01T00:00:00Z",
                        },
                    ],
                }),
            });

        render(<NotificacionesPage />);

        expect(
            await screen.findByText(
                "Solicitud aceptada",
            ),
        ).toBeInTheDocument();

        expect(
            screen.getByText(
                "Tu solicitud fue aceptada.",
            ),
        ).toBeInTheDocument();

        expect(
            screen.getByText("Nueva"),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("button", {
                name: /marcar como leída/i,
            }),
        ).toBeInTheDocument();
    });

    it("permite marcar una notificación como leída", async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    notificaciones: [
                        {
                            id: "1",
                            tipo: "SOLICITUD_ACEPTADA",
                            titulo:
                                "Solicitud aceptada",
                            mensaje:
                                "Tu solicitud fue aceptada.",
                            leida: false,
                            creadaEn:
                                "2025-01-01T00:00:00Z",
                        },
                    ],
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
            });

        render(<NotificacionesPage />);

        fireEvent.click(
            await screen.findByRole(
                "button",
                {
                    name:
                        /marcar como leída/i,
                },
            ),
        );

        await waitFor(() => {
            expect(
                global.fetch,
            ).toHaveBeenCalledWith(
                "/api/notificaciones/1/marcar-leida",
                expect.objectContaining({
                    method: "PATCH",
                }),
            );
        });
    });

    it("permite marcar todas como leídas", async () => {
        global.fetch = jest
            .fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    notificaciones: [
                        {
                            id: "1",
                            tipo: "SOLICITUD_ACEPTADA",
                            titulo:
                                "Solicitud aceptada",
                            mensaje:
                                "Tu solicitud fue aceptada.",
                            leida: false,
                            creadaEn:
                                "2025-01-01T00:00:00Z",
                        },
                    ],
                }),
            })
            .mockResolvedValueOnce({
                ok: true,
            });

        render(<NotificacionesPage />);

        fireEvent.click(
            await screen.findByRole(
                "button",
                {
                    name:
                        /marcar todas como leídas/i,
                },
            ),
        );

        await waitFor(() => {
            expect(
                global.fetch,
            ).toHaveBeenCalledWith(
                "/api/notificaciones/marcar-todas-leidas",
                expect.objectContaining({
                    method: "PATCH",
                }),
            );
        });
    });
    it(
        "muestra enlaces a solicitud y publicación cuando existen ambos ids",
        async () => {
            global.fetch = jest
                .fn()
                .mockResolvedValue({
                    ok: true,
                    json: async () => ({
                        notificaciones: [
                            {
                                id: "1",
                                tipo: "SOLICITUD_ACEPTADA",
                                titulo:
                                    "Solicitud aceptada",
                                mensaje:
                                    "Tu solicitud fue aceptada.",
                                leida: false,
                                solicitudId: "123",
                                publicacionId: "456",
                                creadaEn:
                                    "2025-01-01T00:00:00Z",
                            },
                        ],
                    }),
                });

            render(
                <NotificacionesPage />,
            );

            expect(
                await screen.findByRole(
                    "link",
                    {
                        name:
                            /ver solicitud/i,
                    },
                ),
            ).toBeInTheDocument();

            expect(
                screen.getByRole(
                    "link",
                    {
                        name:
                            /ver publicación/i,
                    },
                ),
            ).toBeInTheDocument();
        },
    );
});