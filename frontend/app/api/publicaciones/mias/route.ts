import { NextResponse } from "next/server";

const backendBase =
  process.env.API_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

/**
 * Proxy del listado de publicaciones propias hacia el backend.
 *
 * Reenvía la cabecera de autorización y el filtro opcional `estado`.
 *
 * @param request Petición entrante con la cabecera de autorización y la query.
 * @returns Respuesta del backend con las publicaciones del usuario, o 503.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const query = estado ? `?estado=${encodeURIComponent(estado)}` : "";

    const res = await fetch(`${backendBase}/publicaciones/mias${query}`, {
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    const data = await res.json();

    return NextResponse.json(data, {
      status: res.status,
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "No se pudo conectar con el backend.",
      },
      {
        status: 503,
      }
    );
  }
}