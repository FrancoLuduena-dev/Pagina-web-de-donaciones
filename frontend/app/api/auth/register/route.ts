import { NextResponse } from "next/server";

/**
 * Proxy POST para creación de usuario.
 *
 * Recibe los datos de registro desde el frontend y los reenvía
 * al backend `/usuario` para crear un nuevo usuario.
 *
 * @param request - Request HTTP entrante de Next.js
 *
 * @returns
 * - 200/201: Respuesta del backend con el usuario creado
 * - 400: Cuerpo inválido
 * - 5xx: Error de conexión o backend no disponible
 *
 * @remarks
 * Flujo del endpoint:
 * 1. Intenta parsear el body como JSON.
 * 2. Reenvía la solicitud al backend `/usuario`.
 * 3. Devuelve la respuesta tal cual del backend.
 *
 * Este endpoint actúa como un proxy transparente de creación de usuario.
 *
 * @example
 * POST /api/usuario
 * Body:
 * {
 *   "correo": "test@mail.com",
 *   "contrasenia": "123456",
 *   "nombre": "Juan"
 * }
 */
const backendBase =
  process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export async function POST(request: Request) {
  let body: unknown;
  
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Cuerpo inválido." }, { status: 400 });
  }

  try {
    const res = await fetch(`${backendBase}/usuario`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
          "No se pudo conectar con el servidor.",
      },
      { status: 503 }
    );
  }
}