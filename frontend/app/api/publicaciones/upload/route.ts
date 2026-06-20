import { NextResponse } from "next/server";

import { MAX_IMAGENES_PUBLICACION } from "@/constants/publicacionesBackend";

const backendBase =
  process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export async function POST(request: Request) {
  const authToken = request.headers
    .get("Authorization")
    ?.replace(/^Bearer\s+/, "");

  if (!authToken) {
    return NextResponse.json(
      { message: "Token de autenticación faltante." },
      { status: 401 },
    );
  }

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ message: "Formulario inválido." }, { status: 400 });
  }

  const imagenes = formData
    .getAll("imagenes")
    .filter((item): item is File => item instanceof File);

  if (!imagenes.length) {
    return NextResponse.json(
      { message: "No se recibió ninguna imagen." },
      { status: 400 },
    );
  }

  if (imagenes.length > MAX_IMAGENES_PUBLICACION) {
    return NextResponse.json(
      { message: `Podés subir hasta ${MAX_IMAGENES_PUBLICACION} imágenes.` },
      { status: 400 },
    );
  }

  const backendForm = new FormData();
  imagenes.forEach((imagen) => backendForm.append("imagenes", imagen));

  try {
    const res = await fetch(`${backendBase}/publicaciones/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${authToken}` },
      body: backendForm,
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
      { status: 503 },
    );
  }
}
