"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { eliminarPublicacionRequest } from "@/lib/publicaciones";

import styles from "./EliminarPublicacionButton.module.css";

type EliminarPublicacionButtonProps = {
  idPublicacion: string;
  creadorId: string;
};

export default function EliminarPublicacionButton({
  idPublicacion,
  creadorId,
}: EliminarPublicacionButtonProps) {
  const router = useRouter();
  const [puedeEliminar, setPuedeEliminar] = useState(false);
  const [eliminando, setEliminando] = useState(false);
  const [error, setError] = useState("");

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
        setPuedeEliminar(usuario.id === creadorId);
      } catch {
        // Sin permiso visible si falla la verificación
      }
    }

    verificarPermiso();

    return () => {
      activo = false;
    };
  }, [creadorId]);

  const eliminar = async () => {
    const confirmar = window.confirm(
      "¿Eliminar esta publicación? No se va a poder deshacer.",
    );

    if (!confirmar) return;

    setError("");
    setEliminando(true);

    try {
      await eliminarPublicacionRequest(idPublicacion);
      router.push("/publicaciones");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo eliminar la publicación.",
      );
    } finally {
      setEliminando(false);
    }
  };

  if (!puedeEliminar) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.boton}
        onClick={eliminar}
        disabled={eliminando}
      >
        {eliminando ? "Eliminando..." : "Eliminar publicación"}
      </button>
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
