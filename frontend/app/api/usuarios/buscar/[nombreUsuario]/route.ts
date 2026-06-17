import { NextResponse } from "next/server";

const backendBase =
  process.env.API_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export async function GET(
  request: Request,
  context: {
    params: Promise<{
      nombreUsuario: string;
    }>;
  },
) {
  try {
    const authHeader =
      request.headers.get("authorization");

    const { nombreUsuario } =
      await context.params;

    const res = await fetch(
      `${backendBase}/usuario/nombre/${nombreUsuario}`,
      {
        headers: {
          Authorization:
            authHeader ?? "",
        },
      },
    );

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
      },
    );
  }
}