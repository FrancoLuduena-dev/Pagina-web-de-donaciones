import { NextResponse } from "next/server";

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