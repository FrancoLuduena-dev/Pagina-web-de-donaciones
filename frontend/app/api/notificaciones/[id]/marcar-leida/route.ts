import { NextResponse } from "next/server";

const backendBase = process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/**
 * Marca una notificación como leída.
 * @param request Solicitud entrante con autorización.
 * @param context Parámetros de ruta que incluyen el id de la notificación.
 * @returns Respuesta del backend con el resultado de la operación.
 */
export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const authHeader = request.headers.get("authorization");

    const { id } = await context.params;

    const res = await fetch(`${backendBase}/notificaciones/${id}/marcar-leida`, {
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
