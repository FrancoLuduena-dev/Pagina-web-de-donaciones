import type { MotivoDenuncia } from "@/constants/denuncias";
import { Denuncia } from "@/types/Denuncia";

export type CrearDenunciaPayload = {
  publicacionId: string;
  motivo: MotivoDenuncia;
  comentario?: string;
};

export type DenunciaBackend = {
  id: string;
  publicacionId: string;
  motivo: string;
  estado: string;
};

function getToken(): string {
  const token = localStorage.getItem("access_token");

  if (!token) {
    throw new Error(
      "Tenés que iniciar sesión para denunciar una publicación.",
    );
  }

  return token;
}

function mapDenunciaError(
  message: string,
  status: number,
): string {
  if (
    message.includes(
      "DENUNCIA_DUPLICADA",
    )
  ) {
    return "Ya denunciaste esta publicación.";
  }

  if (
    message.includes(
      "NO_PUEDE_DENUNCIAR_PROPIA_PUBLICACION",
    )
  ) {
    return "No podés denunciar tu propia publicación.";
  }

  if (
    message.includes(
      "El comentario no puede contener solo espacios",
    )
  ) {
    return "El comentario no puede contener solo espacios.";
  }

  if (status === 400) {
    return (
      message ||
      "Revisá los datos de la denuncia."
    );
  }

  if (status === 403) {
    return (
      message ||
      "No tenés permiso para denunciar esta publicación."
    );
  }

  if (status === 404) {
    return "La publicación no existe o ya no está disponible.";
  }

  return (
    message ||
    `Error al enviar la denuncia (${status}).`
  );
}

export async function crearDenunciaRequest(
  payload: CrearDenunciaPayload,
): Promise<DenunciaBackend> {
  const res = await fetch(
    "/api/denuncias",
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(payload),
    },
  );

  let data: DenunciaBackend & {
    message?: string | string[];
  } = {} as DenunciaBackend;

  try {
    data = await res.json();
  } catch {
    throw new Error(
      "Respuesta inválida del servidor.",
    );
  }

  if (!res.ok) {
    const raw = Array.isArray(
      data.message,
    )
      ? data.message.join(", ")
      : data.message || "";

    throw new Error(
      mapDenunciaError(
        raw,
        res.status,
      ),
    );
  }

  return data;
}

export async function obtenerDenuncias(
  token: string,
): Promise<Denuncia[]> {
  const response = await fetch(
    "/api/denuncias",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      "No se pudieron obtener las denuncias",
    );
  }

  return response.json();
}

export async function tomarDenuncia(
  id: string,
  version: number,
  token: string,
): Promise<void> {
  const response = await fetch(
    `/api/denuncias/${id}/tomar`,
    {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        version,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(
      "No se pudo tomar la denuncia",
    );
  }
}