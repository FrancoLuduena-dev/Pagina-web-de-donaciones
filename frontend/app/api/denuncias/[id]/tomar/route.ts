import { NextResponse } from "next/server";

const backendBase = process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/**
 * Toma una denuncia para ser resuelta por el moderador.
 * @param request Solicitud entrante con token y cuerpo JSON.
 * @param context Parámetros de ruta donde se obtiene el id de denuncia.
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

  const { id } = await context.params;

  try {
    const res = await fetch(`${backendBase}/denuncias/${id}/tomar`, {
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
