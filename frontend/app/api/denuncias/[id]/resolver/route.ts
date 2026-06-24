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
  const authToken = request.headers
    .get("Authorization")
    ?.replace(/^Bearer\s+/, "");

  if (!authToken) {
    return NextResponse.json(
      {
        message:
          "Token de autenticación faltante.",
      },
      { status: 401 },
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        message: "Cuerpo inválido.",
      },
      { status: 400 },
    );
  }

  try {
    const { id } =
      await context.params;

    const res = await fetch(
      `${backendBase}/denuncias/${id}/resolver`,
      {
        method: "PATCH",
        headers: {
          "Content-Type":
            "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      },
    );

    const text = await res.text();

    const contentType =
      res.headers.get("content-type") ??
      "application/json";

    return new NextResponse(text, {
      status: res.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch {
    return NextResponse.json(
      {
        message:
          "No se pudo conectar con el servidor. ¿Está corriendo el backend?",
      },
      { status: 503 },
    );
  }
}