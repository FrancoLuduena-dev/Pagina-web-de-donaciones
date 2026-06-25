import { NextResponse } from "next/server";

const backendBase = process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

/**
 * Obtiene las solicitudes del usuario autenticado.
 * @param request Solicitud entrante con cabecera Authorization.
 * @returns Lista de solicitudes propias o error de conexión.
 */
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");

    const res = await fetch(`${backendBase}/solicitudes/mias`, {
      headers: {
        Authorization: authHeader ?? "",
      },
      cache: "no-store",
    });

    const data = await res.json();

    return NextResponse.json(data, {
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
