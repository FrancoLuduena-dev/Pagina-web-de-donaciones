import type {
  CrearPublicacionPayload,
  EditarPublicacionPayload,
  PublicacionBackend,
} from "@/types/PublicacionBackend";
import type { CondicionObjeto } from "@/constants/publicacionesBackend";
import { MAX_IMAGENES_PUBLICACION } from "@/constants/publicacionesBackend";

export type { CrearPublicacionPayload, EditarPublicacionPayload, PublicacionBackend };

/**
 * Obtiene el token de acceso desde `localStorage`.
 *
 * @returns Token de acceso del usuario autenticado.
 * @throws Error si no hay un token almacenado.
 */
function getToken(): string {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Tenés que iniciar sesión para continuar.");
  }
  return token;
}

/**
 * Sube un lote de imágenes de publicación al backend.
 *
 * @param files Archivos de imagen a subir (hasta `MAX_IMAGENES_PUBLICACION`).
 * @returns URLs públicas de las imágenes subidas.
 * @throws Error si se supera el máximo de imágenes o si falla la subida.
 */
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

/**
 * Sube una única imagen de publicación.
 *
 * @param file Archivo de imagen a subir.
 * @returns URL pública de la imagen subida.
 */
export async function subirImagenPublicacionRequest(file: File): Promise<string> {
  const urls = await subirImagenesPublicacionRequest([file]);
  return urls[0];
}

/**
 * Crea una publicación en el backend.
 *
 * @param payload Datos de la publicación, incluida la condición del objeto.
 * @returns Publicación creada tal como la devuelve el backend.
 * @throws Error si la respuesta es inválida o la creación falla.
 */
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

/**
 * Obtiene una publicación por su ID a través de la API interna.
 *
 * @param id Identificador de la publicación.
 * @returns Publicación encontrada.
 * @throws Error con prefijo `404:` si no existe, u otro error si falla.
 */
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

/**
 * Edita una publicación existente.
 *
 * @param id Identificador de la publicación a editar.
 * @param payload Datos a actualizar de la publicación.
 * @returns Publicación actualizada.
 * @throws Error si la respuesta es inválida o la edición falla.
 */
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

/**
 * Pausa una publicación.
 *
 * @param id Identificador de la publicación a pausar.
 * @returns Publicación con su estado actualizado.
 * @throws Error si la respuesta es inválida o la operación falla.
 */
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

/**
 * Reactiva una publicación previamente pausada.
 *
 * @param id Identificador de la publicación a reactivar.
 * @returns Publicación con su estado actualizado.
 * @throws Error si la respuesta es inválida o la operación falla.
 */
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

/**
 * Elimina una publicación.
 *
 * @param id Identificador de la publicación a eliminar.
 * @throws Error si la operación falla.
 */
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

/**
 * Obtiene una publicación directamente del backend (uso en Server Components).
 *
 * @param id Identificador de la publicación.
 * @returns Publicación encontrada, o `null` si no existe (404).
 * @throws Error si la respuesta no es exitosa por otro motivo.
 */
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

/**
 * Lista publicaciones del backend aplicando filtros opcionales.
 *
 * Pensada para Server Components; construye la query string con los filtros
 * provistos y consulta el feed público.
 *
 * @param categoriaId Filtro opcional por UUID de categoría.
 * @param condicion Filtro opcional por condición del objeto.
 * @param estado Filtro opcional por estado de la publicación.
 * @param q Texto de búsqueda opcional sobre título y descripción.
 * @returns Publicaciones que cumplen con los filtros.
 * @throws Error si la respuesta no es exitosa.
 */
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

/**
 * Lista las publicaciones del usuario autenticado.
 *
 * @param estado Filtro opcional por estado de la publicación.
 * @returns Publicaciones del usuario que coinciden con el filtro.
 * @throws Error si la respuesta es inválida o la consulta falla.
 */
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

/**
 * Lista todas las publicaciones a través de la API interna.
 *
 * @returns Listado de publicaciones.
 * @throws Error si la respuesta es inválida o la consulta falla.
 */
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
