import { NextResponse } from "next/server";

const backendBase = process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/**
 * Obtiene las denuncias desde el backend.
 * @param request Solicitud entrante con cabecera Authorization.
 * @returns Respuesta con la lista de denuncias o error de autenticación/servidor.
 */
export async function GET(request: Request) {
  const authToken = request.headers.get("Authorization")?.replace(/^Bearer\s+/, "");

  if (!authToken) {
    return NextResponse.json(
      {
        message: "Token de autenticación faltante.",
      },
      { status: 401 },
    );
  }

  try {
    const res = await fetch(`${backendBase}/denuncias`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      cache: "no-store",
    });

    const text = await res.text();

    const contentType = res.headers.get("content-type") ?? "application/json";

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
      },
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
 * Crea una nueva denuncia en el backend.
 * @param request Solicitud entrante con token y cuerpo JSON.
 * @returns Respuesta del backend al crear la denuncia o error de autenticación.
 */
export async function POST(request: Request) {
  const authToken = request.headers.get("Authorization")?.replace(/^Bearer\s+/, "");

  if (!authToken) {
    return NextResponse.json(
      {
        message: "Token de autenticación faltante.",
      },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: "Cuerpo inválido.",
      },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${backendBase}/denuncias`, {
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
      headers: {
        "Content-Type": contentType,
      },
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
