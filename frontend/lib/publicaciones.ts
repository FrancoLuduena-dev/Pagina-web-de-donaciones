import type {
  CrearPublicacionPayload,
  EditarPublicacionPayload,
  PublicacionBackend,
} from "@/types/PublicacionBackend";
import type { CondicionObjeto } from "@/constants/publicacionesBackend";

export type { CrearPublicacionPayload, EditarPublicacionPayload, PublicacionBackend };

function getToken(): string {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Tenés que iniciar sesión para continuar.");
  }
  return token;
}

export async function subirImagenPublicacionRequest(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("imagen", file);

  const res = await fetch("/api/publicaciones/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });

  let data: { imagenUrl?: string; message?: string | string[] } = {};
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }

  if (!res.ok || !data.imagenUrl) {
    const msg = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Error al subir imagen (${res.status}).`;
    throw new Error(msg);
  }

  return data.imagenUrl;
}

export async function crearPublicacionRequest(
  payload: CrearPublicacionPayload & { condicion: CondicionObjeto },
): Promise<PublicacionBackend> {
  const res = await fetch("/api/publicaciones", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  let data: PublicacionBackend & { message?: string | string[] } = {} as PublicacionBackend;
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }

  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Error al crear publicación (${res.status}).`;
    throw new Error(msg);
  }

  return data;
}

export async function obtenerPublicacionRequest(
  id: string,
): Promise<PublicacionBackend> {
  const res = await fetch(`/api/publicaciones/${id}`);

  let data: PublicacionBackend & { message?: string | string[] } = {} as PublicacionBackend;
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }

  if (res.status === 404) {
    throw new Error("404: Publicación no encontrada");
  }

  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Error al obtener publicación (${res.status}).`;
    throw new Error(msg);
  }

  return data;
}

export async function editarPublicacionRequest(
  id: string,
  payload: EditarPublicacionPayload,
): Promise<PublicacionBackend> {
  const res = await fetch(`/api/publicaciones/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  let data: PublicacionBackend & { message?: string | string[] } = {} as PublicacionBackend;
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }

  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Error al editar publicación (${res.status}).`;
    throw new Error(msg);
  }

  return data;
}

const backendBase =
  process.env.API_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export async function obtenerPublicacionPorId(
  id: string,
): Promise<PublicacionBackend | null> {
  const res = await fetch(`${backendBase}/publicaciones/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Error al obtener publicación (${res.status}).`);
  }

  return res.json();
}

export async function listarPublicacionesDesdeBackend(
  categoriaId?: string,
  // TEST_DESCOMENTAR
  /*
  condicion?: string,
  estado?: string,
  */
  // END_TEST_DESCOMENTAR
): Promise<PublicacionBackend[]> {
  const params = new URLSearchParams();

  if (categoriaId) {
    params.append("categoriaId", categoriaId);
  }

  // TEST_DESCOMENTAR
  /*
  if (condicion) {
    params.append("condicion", condicion);
  }

  if (estado) {
    params.append("estado", estado);
  }
  */
  // END_TEST_DESCOMENTAR

  const url =
    params.toString().length > 0
      ? `${backendBase}/publicaciones?${params.toString()}`
      : `${backendBase}/publicaciones`;

  const res = await fetch(url, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Error al listar publicaciones (${res.status}).`);
  }

  return res.json();
}

export async function listarPublicacionesRequest(): Promise<PublicacionBackend[]> {
  const res = await fetch("/api/publicaciones");

  let data: PublicacionBackend[] | { message?: string } = [];
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }

  if (!res.ok) {
    const msg =
      !Array.isArray(data) && data.message
        ? data.message
        : `Error al listar publicaciones (${res.status}).`;
    throw new Error(msg);
  }

  return data as PublicacionBackend[];
}
