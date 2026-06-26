"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type EditarPublicacionLinkProps = {
  idPublicacion: string;
  creadorId: string;
  estadoPublicacion: string;
  className?: string;
};

/**
 * Enlace para editar una publicación, visible solo para su creador.
 *
 * Verifica contra `/api/auth/me` que el usuario autenticado sea el creador y
 * que el estado de la publicación permita editarla (disponible o pausada). Si
 * no se cumplen ambas condiciones no se renderiza nada.
 *
 * @param props Propiedades del componente.
 * @param props.idPublicacion Identificador de la publicación.
 * @param props.creadorId Identificador del creador de la publicación.
 * @param props.estadoPublicacion Estado actual de la publicación.
 * @param props.className Clase CSS opcional para el enlace.
 * @returns Enlace de edición o `null` si el usuario no puede editar.
 */
export default function EditarPublicacionLink({
  idPublicacion,
  creadorId,
  estadoPublicacion,
  className,
}: EditarPublicacionLinkProps) {
  const [puedeEditar, setPuedeEditar] = useState(false);

  const estadoPermiteEditar =
    estadoPublicacion === "DISPONIBLE" || estadoPublicacion === "PAUSADA";

  useEffect(() => {
    let activo = true;

    async function verificarPermiso() {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok || !activo) return;

        const usuario = await res.json();
        setPuedeEditar(usuario.id === creadorId);
      } catch {
        // Sin enlace si falla la verificación
      }
    }

    verificarPermiso();

    return () => {
      activo = false;
    };
  }, [creadorId, estadoPublicacion]);

  if (!puedeEditar || !estadoPermiteEditar) {
    return null;
  }

  return (
    <Link
      href={`/publicaciones/publicacion/${idPublicacion}/editar`}
      className={className}
    >
      Editar publicación
    </Link>
  );
}
