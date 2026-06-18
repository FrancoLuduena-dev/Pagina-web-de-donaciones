import { NextResponse } from "next/server";

const backendBase =
  process.env.API_URL?.replace(/\/$/, "") ??
  "http://localhost:3000";

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const authHeader =
      request.headers.get("authorization");

    const { id } =
      await context.params;

    const body =
      await request.json();

    const res = await fetch(
      `${backendBase}/solicitudes/${id}/rechazar`,
      {
        method: "PATCH",
        headers: {
          Authorization:
            authHeader ?? "",
          "Content-Type":
            "application/json",
        },
        body: JSON.stringify(body),
      },
    );

    const text = await res.text();

    return new Response(text, {
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
