import { NextResponse } from "next/server";

const backendBase = process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/**
 * Crea una solicitud de donación en el backend.
 * @param request Solicitud entrante con token y cuerpo JSON.
 * @returns Respuesta del backend con el resultado de la creación.
 */
export async function POST(request: Request) {
  const authToken = request.headers.get("Authorization")?.replace(/^Bearer\s+/, "");

  if (!authToken) {
    return NextResponse.json({ message: "Token de autenticación faltante." }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido." }, { status: 400 });
  }

  try {
    const res = await fetch(`${backendBase}/solicitudes`, {
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
