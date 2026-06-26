import { NextResponse } from "next/server";

const backendBase =
  process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";


/**
* Proxy PATCH para actualización de usuario.
*
* Este handler recibe una solicitud PATCH desde el frontend,
* valida el cuerpo y el token de autenticación, y reenvía la
* petición al backend correspondiente.
*
* @param request - Request HTTP entrante de Next.js
*
* @returns Respuesta del backend o error controlado en formato JSON
*
* @remarks
* Flujo de ejecución:
* 1. Intenta parsear el body como JSON.
* 2. Valida existencia del token Bearer en headers.
* 3. Reenvía la petición al backend `/usuario/actualizarUsuario`.
* 4. Devuelve la respuesta tal cual del backend.
*
* @throws Nunca lanza errores sin capturar; siempre retorna NextResponse.
*
* @example
* PATCH /api/usuario
* Authorization: Bearer <token>
* Body: { nombre: "Juan" }
*/
export async function PATCH(request: Request) {
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
    const res = await fetch(`${backendBase}/usuario/actualizarUsuario`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${authToken}` },
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
      { status: 503 }
    );
  }
}