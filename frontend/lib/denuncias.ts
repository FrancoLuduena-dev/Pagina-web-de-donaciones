import { Denuncia } from "@/types/Denuncia";

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