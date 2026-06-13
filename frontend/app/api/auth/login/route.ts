import { NextResponse } from "next/server";

const backendBase =
  process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3001";

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
          "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
      },
      { status: 503 }
    );
  }
}
