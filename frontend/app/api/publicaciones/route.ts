import { NextResponse } from "next/server";

const backendBase = process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/**
 * Proxy del listado público de publicaciones hacia el backend.
 *
 * @returns Respuesta del backend con el feed, o 503 si no está disponible.
 */
export async function GET() {
  try {
    const res = await fetch(`${backendBase}/publicaciones`, {
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
        message: "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
      },
      { status: 503 },
    );
  }
}

/**
 * Proxy de creación de publicación hacia el backend.
 *
 * Valida el cuerpo y el token de autenticación antes de reenviar la petición.
 *
 * @param request Petición entrante con el cuerpo y la cabecera de autorización.
 * @returns Respuesta del backend, o 400/401/503 según el caso.
 */
export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido." }, { status: 400 });
  }

  const authToken = request.headers.get("Authorization")?.replace(/^Bearer\s+/, "");

  if (!authToken) {
    return NextResponse.json({ message: "Token de autenticación faltante." }, { status: 401 });
  }

  try {
    const res = await fetch(`${backendBase}/publicaciones`, {
      method: "POST",
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
        message: "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
      },
      { status: 503 },
    );
  }
}
