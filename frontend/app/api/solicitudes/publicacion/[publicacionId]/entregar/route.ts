import { NextResponse } from "next/server";

const backendBase = process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

type RouteContext = {
  params: Promise<{ publicacionId: string }>;
};

/**
 * Marca una publicación como entregada.
 * @param request Solicitud entrante con autorización.
 * @param context Parámetros de ruta que incluyen publicacionId.
 * @returns Respuesta del backend con el resultado de la entrega.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const { publicacionId } = await context.params;

  const authToken = request.headers.get("Authorization")?.replace(/^Bearer\s+/, "");

  if (!authToken) {
    return NextResponse.json({ message: "Token de autenticación faltante." }, { status: 401 });
  }

  try {
    const res = await fetch(`${backendBase}/solicitudes/publicacion/${publicacionId}/entregar`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${authToken}` },
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
