import { NextResponse } from "next/server";

const backendBase =
  process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Proxy para reactivar una publicación hacia el backend.
 *
 * Valida el token antes de reenviar la petición.
 *
 * @param request Petición entrante con la cabecera de autorización.
 * @param context Contexto de ruta con el `id` de la publicación.
 * @returns Respuesta del backend, o 401/503 según el caso.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  const authToken = request.headers
    .get("Authorization")
    ?.replace(/^Bearer\s+/, "");

  if (!authToken) {
    return NextResponse.json(
      { message: "Token de autenticación faltante." },
      { status: 401 },
    );
  }

  try {
    const res = await fetch(`${backendBase}/publicaciones/${id}/reactivar`, {
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
        message:
          "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
      },
      { status: 503 },
    );
  }
}
