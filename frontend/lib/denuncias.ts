import type { MotivoDenuncia } from "@/constants/denuncias";
import { Denuncia } from "@/types/Denuncia";

/**
 * Payload para crear una denuncia.
 */
export type CrearDenunciaPayload = {
  /** Identificador de la publicación a denunciar. */
  publicacionId: string;
  /** Motivo de la denuncia. */
  motivo: MotivoDenuncia;
  /** Comentario opcional (obligatorio cuando el motivo es `OTRO`). */
  comentario?: string;
};

/** Denuncia tal como la devuelve el backend al crearla. */
export type DenunciaBackend = {
  /** Identificador de la denuncia. */
  id: string;
  /** Identificador de la publicación denunciada. */
  publicacionId: string;
  /** Código del motivo de la denuncia. */
  motivo: string;
  /** Estado de la denuncia. */
  estado: string;
};

/**
 * Obtiene el token de acceso guardado en localStorage.
 * @returns Token de autorización.
 * @throws Error si no hay sesión iniciada.
 */
function getToken(): string {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error("Tenés que iniciar sesión para denunciar una publicación.");
  }

  return token;
}

/**
 * Convierte errores de la API de denuncias en mensajes legibles.
 * @param message Mensaje crudo devuelto por el servidor.
 * @param status Código de estado HTTP.
 * @returns Mensaje de error legible para el usuario.
 */
function mapDenunciaError(message: string, status: number): string {
  if (message.includes("DENUNCIA_DUPLICADA")) {
    return "Ya denunciaste esta publicación.";
  }

  if (message.includes("NO_PUEDE_DENUNCIAR_PROPIA_PUBLICACION")) {
    return "No podés denunciar tu propia publicación.";
  }

  if (message.includes("El comentario no puede contener solo espacios")) {
    return "El comentario no puede contener solo espacios.";
  }

  if (status === 400) {
    return message || "Revisá los datos de la denuncia.";
  }

  if (status === 403) {
    return message || "No tenés permiso para denunciar esta publicación.";
  }

  if (status === 404) {
    return "La publicación no existe o ya no está disponible.";
  }

  return message || `Error al enviar la denuncia (${status}).`;
}

/**
 * Envía una solicitud para crear una nueva denuncia.
 * @param payload Datos de la denuncia.
 * @returns Respuesta normalizada de la denuncia creada.
 */
export async function crearDenunciaRequest(payload: CrearDenunciaPayload): Promise<DenunciaBackend> {
  const res = await fetch("/api/denuncias", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  let data: DenunciaBackend & {
    message?: string | string[];
  } = {} as DenunciaBackend;

  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }

  if (!res.ok) {
    const raw = Array.isArray(data.message) ? data.message.join(", ") : data.message || "";

    throw new Error(mapDenunciaError(raw, res.status));
  }

  return data;
}

/**
 * Obtiene la lista de denuncias pendientes.
 * @param token Token de autorización del moderador.
 * @returns Arreglo de denuncias.
 */
export async function obtenerDenuncias(token: string): Promise<Denuncia[]> {
  const response = await fetch("/api/denuncias", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("No se pudieron obtener las denuncias");
  }

  return response.json();
}

/**
 * Marca una denuncia como tomada por el moderador.
 * @param id Identificador de la denuncia.
 * @param version Versión de la denuncia para control de concurrencia.
 * @param token Token de autorización.
 * @returns Void si la acción se completa correctamente.
 */
export async function tomarDenuncia(id: string, version: number, token: string): Promise<void> {
  const response = await fetch(`/api/denuncias/${id}/tomar`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      version,
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo tomar la denuncia");
  }
}
/**
 * Resuelve una denuncia con la decisión del moderador.
 * @param id Identificador de la denuncia.
 * @param version Versión actual de la denuncia.
 * @param tipoResolucion Tipo de resolución elegido.
 * @param detalleResolucion Detalle adicional de la resolución.
 * @param token Token de autorización.
 * @returns Void si la resolución se procesa correctamente.
 */
export async function resolverDenuncia(id: string, version: number, tipoResolucion: string, detalleResolucion: string, token: string): Promise<void> {
  const response = await fetch(`/api/denuncias/${id}/resolver`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      version,
      tipoResolucion,
      detalleResolucion,
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo resolver la denuncia");
  }
}
