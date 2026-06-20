export type SolicitudBackend = {
  id: string;
  publicacionId: string;
  solicitanteId: string;
  creadorPublicacionId: string;
  mensaje?: string;
  estado: string;
  createdAt: string;
};

export type CrearSolicitudPayload = {
  publicacionId: string;
  mensaje?: string;
};

function getToken(): string {
  const token = localStorage.getItem("access_token");
  if (!token) {
    throw new Error("Tenés que iniciar sesión para solicitar una publicación.");
  }
  return token;
}

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
