import { NextResponse } from "next/server";

/**
 * Proxy PATCH para restablecer la contraseña del usuario autenticado.
 *
 * Recibe un cuerpo con los datos necesarios para el cambio de contraseña
 * y lo reenvía al backend `/usuario/resetearContrasenia`.
 *
 * @param request - Request HTTP entrante de Next.js
 *
 * @returns
 * - 200: Respuesta del backend si el cambio fue exitoso
 * - 400: Cuerpo inválido
 * - 500: Error interno o fallo en la operación
 *
 * @remarks
 * Flujo del endpoint:
 * 1. Intenta parsear el body como JSON.
 * 2. Obtiene el header Authorization si existe.
 * 3. Reenvía la solicitud al backend con el token.
 * 4. Si el backend responde con error, se propaga como excepción.
 * 5. Devuelve la respuesta cruda del backend manteniendo status y headers.
 *
 * Este endpoint actúa como proxy transparente entre frontend y backend.
 *
 * @example
 * PATCH /api/usuario/resetear-contrasenia
 * Authorization: Bearer <token>
 * Body:
 * {
 *   "contraseniaActual": "123",
 *   "nuevaContrasenia": "456"
 * }
 */
const backendBase =
process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export async function PATCH(request: Request) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ message: "Cuerpo inválido." }, { status: 400 });
    }

    const auth = request.headers.get("authorization");

    try { 
        // request a back endpoint que reinicia la contraseña del usuario autenticado, pasando el body recibido como json en el cuerpo de la petición
        const res = await fetch(`${backendBase}/usuario/resetearContrasenia`, { // res contiene la respuesta del backend, que la espera con el fetch. Tambien contiene un status. 
            method: "PATCH",
            headers: { "Content-Type": "application/json", ...(auth ? { Authorization: auth } : {}) },  // le dice al backend que el cuerpo de la petición es un json, manda token para verificar que el usuario esta autenticado, si no hay token, no manda el header de authorization
            body: JSON.stringify(body), // Convierte el objeto JS a JSON
        });

        if (!res.ok) throw new Error("Error al intentar restablecer la contraseña."); // si el status de la respuesta del backend no es 2xx, lanza un error para que lo maneje el frontend

        const text = await res.text(); // lee la respuesta del back y la convierte a texto
        const contentType = res.headers.get("content-type") ?? "application/json"; // verifica que tipo de respuesta recibio del back, si no tiene content-type, asume que es json

        return new NextResponse(text, { // este es el proxy o intermediario que devuelve la respuesta del backend al frontend, con el mismo status y content-type que recibio del backend
            status: res.status,
            headers: { "Content-Type": contentType },
        });

        
    } catch {
        return NextResponse.json({ message: "Error al intentar restablecer la contraseña." }, { status: 500 });
    }
}