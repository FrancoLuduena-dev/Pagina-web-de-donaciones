import type {
  CrearPublicacionPayload,
  EditarPublicacionPayload,
  PublicacionBackend,
} from "@/types/PublicacionBackend";
import type { CondicionObjeto } from "@/constants/publicacionesBackend";
import { MAX_IMAGENES_PUBLICACION } from "@/constants/publicacionesBackend";

export type { CrearPublicacionPayload, EditarPublicacionPayload, PublicacionBackend };

function getToken(): string {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Tenés que iniciar sesión para continuar.");
  }
  return token;
}

export async function subirImagenesPublicacionRequest(
  files: File[],
): Promise<string[]> {
  if (!files.length) {
    return [];
  }

  if (files.length > MAX_IMAGENES_PUBLICACION) {
    throw new Error(`Podés subir hasta ${MAX_IMAGENES_PUBLICACION} imágenes.`);
  }

  const formData = new FormData();
  files.forEach((file) => formData.append("imagenes", file));

  const res = await fetch("/api/publicaciones/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });

  let data: { imagenUrls?: string[]; message?: string | string[] } = {};
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }

  if (!res.ok || !data.imagenUrls?.length) {
    const msg = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Error al subir imágenes (${res.status}).`;
    throw new Error(msg);
  }

  return data.imagenUrls;
}

export async function subirImagenPublicacionRequest(file: File): Promise<string> {
  const urls = await subirImagenesPublicacionRequest([file]);
  return urls[0];
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

export async function pausarPublicacionRequest(id: string): Promise<PublicacionBackend> {
  const res = await fetch(`/api/publicaciones/${id}/pausar`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${getToken()}` },
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
      : data.message || `Error al pausar publicación (${res.status}).`;
    throw new Error(msg);
  }

  return data;
}

export async function reactivarPublicacionRequest(
  id: string,
): Promise<PublicacionBackend> {
  const res = await fetch(`/api/publicaciones/${id}/reactivar`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${getToken()}` },
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
      : data.message || `Error al reactivar publicación (${res.status}).`;
    throw new Error(msg);
  }

  return data;
}

export async function eliminarPublicacionRequest(id: string): Promise<void> {
  const res = await fetch(`/api/publicaciones/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  let data: { message?: string | string[] } = {};
  try {
    data = await res.json();
  } catch {
    if (!res.ok) {
      throw new Error(`Error al eliminar publicación (${res.status}).`);
    }
    return;
  }

  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Error al eliminar publicación (${res.status}).`;
    throw new Error(msg);
  }
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
  condicion?: string,
  estado?: string,
  q?: string,
): Promise<PublicacionBackend[]> {
  const params = new URLSearchParams();

  if (categoriaId) {
    params.append("categoriaId", categoriaId);
  }
  if (condicion) {
    params.append("condicion", condicion);
  }

  if (estado) {
    params.append("estado", estado);
  }

  if (q) {
    params.append("q", q);
  }

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

export async function listarMisPublicacionesRequest(
  estado?: string,
): Promise<PublicacionBackend[]> {
  const params = estado ? `?estado=${encodeURIComponent(estado)}` : "";
  const res = await fetch(`/api/publicaciones/mias${params}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  let data: PublicacionBackend[] | { message?: string | string[] } = [];
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }

  if (!res.ok) {
    const msg = Array.isArray((data as { message?: string[] }).message)
      ? (data as { message: string[] }).message.join(", ")
      : (data as { message?: string }).message ||
        `Error al listar tus publicaciones (${res.status}).`;
    throw new Error(msg);
  }

  return data as PublicacionBackend[];
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
