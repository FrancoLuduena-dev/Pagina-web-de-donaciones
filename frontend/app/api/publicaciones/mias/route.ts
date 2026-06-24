import { NextResponse } from "next/server";

const backendBase =
  process.env.API_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");
    const query = estado ? `?estado=${encodeURIComponent(estado)}` : "";

    const res = await fetch(`${backendBase}/publicaciones/mias${query}`, {
      headers: {
        Authorization: authHeader ?? "",
      },
    });

    const data = await res.json();

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