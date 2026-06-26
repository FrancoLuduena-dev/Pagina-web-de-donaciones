import { NextResponse } from "next/server";

const backendBase = process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/**
 * Cancela una solicitud de donación.
 * @param request Solicitud entrante con autorización y cuerpo JSON.
 * @param context Parámetros de ruta que incluyen el id de la solicitud.
 * @returns Respuesta del backend con el resultado de la cancelación.
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

    const body = await request.json();

    const res = await fetch(`${backendBase}/solicitudes/${id}/cancelar`, {
      method: "PATCH",
      headers: {
        Authorization: authHeader ?? "",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
