import { NextResponse } from "next/server";

/**
 * Proxy de login de usuario.
 *
 * Recibe credenciales desde el frontend, las valida superficialmente
 * y reenvía la solicitud al backend `/usuario/login`.
 *
 * Devuelve un `accessToken` en caso de autenticación exitosa.
 *
 * @param request - Request HTTP entrante de Next.js
 *
 * @returns
 * - 200: Token de acceso si el login es exitoso
 * - 400: Cuerpo inválido
 * - 401: Credenciales incorrectas
 * - 5xx: Errores del backend o conexión
 *
 * @remarks
 * El flujo de este endpoint es:
 * 1. Parsear el body como JSON.
 * 2. Reenviar credenciales al backend.
 * 3. Manejar errores de autenticación o respuesta.
 * 4. Normalizar respuesta para el frontend.
 *
 * @example
 * POST /api/login
 * Body:
 * {
 *   "correo": "test@mail.com",
 *   "contrasenia": "123456"
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
    const res = await fetch(`${backendBase}/usuario/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      const msg =
        data.message ||
        (res.status === 401
          ? "Correo o contraseña incorrectos."
          : `Error al iniciar sesión (${res.status}).`);

      return NextResponse.json({ message: msg }, { status: res.status });
    }

    return NextResponse.json(
      { accessToken: data.accessToken },
      { status: 200 }
    );
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
