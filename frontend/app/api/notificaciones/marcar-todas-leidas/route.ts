import { NextResponse } from "next/server";

const backendBase = process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/**
 * Marca todas las notificaciones del usuario como leídas.
 * @param request Solicitud entrante con token de autorización.
 * @returns Respuesta del backend con el resultado de la operación.
 */
export async function PATCH(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    const res = await fetch(`${backendBase}/notificaciones/marcar-todas-leidas`, {
      method: "PATCH",
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    const text = await res.text();

    return new Response(text, {
      status: res.status,
    });
  } catch {
    return NextResponse.json(
      {
        message: "No se pudo conectar con el backend.",
      },
      {
        status: 503,
      },
    );
  }
}
