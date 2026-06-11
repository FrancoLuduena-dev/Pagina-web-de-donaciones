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
    const res = await fetch(`${backendBase}/auth/register`, {
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
          "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
      },
      { status: 503 }
    );
  }
}