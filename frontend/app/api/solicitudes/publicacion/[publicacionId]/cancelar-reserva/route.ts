import { NextResponse } from "next/server";

const backendBase = process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

type RouteContext = {
  params: Promise<{ publicacionId: string }>;
};

/**
 * Cancela la reserva de una publicación.
 * @param request Solicitud entrante con autorización y cuerpo opcional.
 * @param context Parámetros de ruta que incluyen publicacionId.
 * @returns Respuesta del backend con el resultado de la cancelación.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const { publicacionId } = await context.params;

  const authToken = request.headers.get("Authorization")?.replace(/^Bearer\s+/, "");

  if (!authToken) {
    return NextResponse.json({ message: "Token de autenticación faltante." }, { status: 401 });
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  try {
    const res = await fetch(`${backendBase}/solicitudes/publicacion/${publicacionId}/cancelar-reserva`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    const contentType = res.headers.get("content-type") ?? "application/json";

    return new NextResponse(text, {
      status: res.status,
      headers: { "Content-Type": contentType },
    });
  } catch {
    return NextResponse.json(
      {
        message: "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
      },
      { status: 503 },
    );
  }
}
