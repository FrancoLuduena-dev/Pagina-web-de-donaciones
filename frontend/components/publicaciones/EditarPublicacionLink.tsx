"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type EditarPublicacionLinkProps = {
  idPublicacion: string;
  creadorId: string;
  className?: string;
};

export default function EditarPublicacionLink({
  idPublicacion,
  creadorId,
  className,
}: EditarPublicacionLinkProps) {
  const [puedeEditar, setPuedeEditar] = useState(false);

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
  }, [creadorId]);

  if (!puedeEditar) {
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
