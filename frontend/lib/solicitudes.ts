/**
 * Estructura de una solicitud recibida desde el backend.
 */
export type SolicitudBackend = {
  id: string;
  publicacionId: string;
  solicitanteId: string;
  creadorPublicacionId: string;
  mensaje?: string;
  estado: string;
  createdAt: string;
};

/**
 * Payload para crear una nueva solicitud.
 */
export type CrearSolicitudPayload = {
  publicacionId: string;
  mensaje?: string;
};

/**
 * Obtiene el token de acceso actual desde localStorage.
 * @returns Token de autorización.
 * @throws Error si no hay sesión iniciada.
 */
function getToken(): string {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Tenés que iniciar sesión para solicitar una publicación.");
  }
  return token;
}

/**
 * Envía una solicitud para crear una nueva reserva.
 * @param payload Datos necesarios para crear la solicitud.
 * @returns Respuesta de la solicitud creada.
 */
export async function crearSolicitudRequest(
  payload: CrearSolicitudPayload,
): Promise<SolicitudBackend> {
  const res = await fetch("/api/solicitudes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(payload),
  });

  let data: SolicitudBackend & { message?: string | string[] } = {} as SolicitudBackend;
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }

  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Error al crear solicitud (${res.status}).`;
    throw new Error(msg);
  }

  return data;
}

export async function listarMisSolicitudesRequest(): Promise<SolicitudBackend[]> {
  /**
   * Lista las solicitudes realizadas por el usuario actual.
   * @returns Arreglo de solicitudes del usuario.
   */
  const res = await fetch("/api/solicitudes/mias", {
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  let data: SolicitudBackend[] | { message?: string } = [];
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }

  if (!res.ok) {
    const msg =
      !Array.isArray(data) && data.message
        ? data.message
        : `Error al listar solicitudes (${res.status}).`;
    throw new Error(msg);
  }

  return data as SolicitudBackend[];
}

export const ESTADOS_SOLICITUD_ACTIVA = ["PENDIENTE", "ACEPTADA"];

/**
 * Marca una publicación como entregada en una solicitud.
 * @param publicacionId ID de la publicación entregada.
 * @returns Solicitud actualizada tras la entrega.
 */
export async function entregarPublicacionRequest(
  publicacionId: string,
): Promise<SolicitudBackend> {
  const res = await fetch(
    `/api/solicitudes/publicacion/${publicacionId}/entregar`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${getToken()}` },
    },
  );

  let data: SolicitudBackend & { message?: string | string[] } = {} as SolicitudBackend;
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }

  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Error al marcar como entregada (${res.status}).`;
    throw new Error(msg);
  }

  return data;
}

/**
 * Cancela una reserva de publicación.
 * @param publicacionId ID de la publicación cuya reserva se cancela.
 * @param motivo Motivo opcional de cancelación.
 * @returns Solicitud actualizada tras la cancelación.
 */
export async function cancelarReservaPublicacionRequest(
  publicacionId: string,
  motivo?: string,
): Promise<SolicitudBackend> {
  const body: { motivo?: string } = {};
  if (motivo?.trim()) {
    body.motivo = motivo.trim();
  }

  const res = await fetch(
    `/api/solicitudes/publicacion/${publicacionId}/cancelar-reserva`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  let data: SolicitudBackend & { message?: string | string[] } = {} as SolicitudBackend;
  try {
    data = await res.json();
  } catch {
    throw new Error("Respuesta inválida del servidor.");
  }

  if (!res.ok) {
    const msg = Array.isArray(data.message)
      ? data.message.join(", ")
      : data.message || `Error al cancelar la reserva (${res.status}).`;
    throw new Error(msg);
  }

  return data;
}
