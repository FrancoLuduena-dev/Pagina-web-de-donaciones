import { NextResponse } from "next/server";

const backendBase =
  process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * Proxy de obtención de una publicación por ID hacia el backend.
 *
 * @param _request Petición entrante (no se usa su cuerpo).
 * @param context Contexto de ruta con el `id` de la publicación.
 * @returns Respuesta del backend con la publicación, o 503 si no está disponible.
 */
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const res = await fetch(`${backendBase}/publicaciones/${id}`, {
      cache: "no-store",
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

/**
 * Proxy de edición de una publicación hacia el backend.
 *
 * Valida el cuerpo y el token antes de reenviar la petición.
 *
 * @param request Petición entrante con el cuerpo y la cabecera de autorización.
 * @param context Contexto de ruta con el `id` de la publicación.
 * @returns Respuesta del backend, o 400/401/503 según el caso.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido." }, { status: 400 });
  }

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
    const res = await fetch(`${backendBase}/publicaciones/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
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
        message:
          "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
      },
      { status: 503 },
    );
  }
}

/**
 * Proxy de eliminación de una publicación hacia el backend.
 *
 * Valida el token antes de reenviar la petición de borrado.
 *
 * @param request Petición entrante con la cabecera de autorización.
 * @param context Contexto de ruta con el `id` de la publicación.
 * @returns Respuesta del backend, o 401/503 según el caso.
 */
export async function DELETE(request: Request, context: RouteContext) {
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
    const res = await fetch(`${backendBase}/publicaciones/${id}/eliminar`, {
      method: "DELETE",
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
