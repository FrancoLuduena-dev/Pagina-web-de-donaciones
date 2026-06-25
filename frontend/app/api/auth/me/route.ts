import { NextResponse } from "next/server";

/**
 * Proxy GET para obtener el usuario autenticado.
 *
 * Reenvía la solicitud al backend `/usuario/mi` incluyendo el token
 * de autenticación recibido en el header Authorization.
 *
 * @param request - Request HTTP entrante de Next.js
 *
 * @returns
 * - 200: Datos del usuario autenticado
 * - 4xx: Errores de autenticación o backend
 * - 503: Error de conexión con el backend
 *
 * @remarks
 * Este endpoint:
 * 1. Extrae el header Authorization.
 * 2. Realiza la petición al backend con cache deshabilitada.
 * 3. Intenta parsear la respuesta como JSON.
 * 4. Si falla el parseo, devuelve un mensaje normalizado.
 *
 * El objetivo es evitar que respuestas no-JSON rompan el frontend.
 *
 * @example
 * GET /api/usuario/mi
 * Authorization: Bearer <token>
 */
const backendBase =
  process.env.API_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export async function GET(request: Request) {
  try {
    const authHeader =
      request.headers.get("authorization");

    const res = await fetch(`${backendBase}/usuario/mi`, {
      headers: {
        Authorization: authHeader ?? "",
      },
      cache: "no-store",
    });

    const text = await res.text();
    let data: unknown = { message: "Error al obtener el usuario." };

    try {
      data = text ? JSON.parse(text) : data;
    } catch {
      data = { message: text || "Respuesta inválida del backend." };
    }

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