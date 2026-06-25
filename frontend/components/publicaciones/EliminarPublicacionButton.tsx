"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { eliminarPublicacionRequest } from "@/lib/publicaciones";
import { RolUsuario } from "@/types/RolUsuario";

import styles from "./EliminarPublicacionButton.module.css";

type EliminarPublicacionButtonProps = {
  idPublicacion: string;
  creadorId: string;
  estadoPublicacion: string;
};

/**
 * Botón para eliminar una publicación (por su creador o por moderación).
 *
 * Verifica la sesión para determinar si el usuario es el creador o un
 * moderador. El creador puede eliminar si el estado lo permite; el moderador
 * puede eliminar por moderación. Pide confirmación y, al eliminar, redirige al
 * listado de publicaciones.
 *
 * @param props Propiedades del componente.
 * @param props.idPublicacion Identificador de la publicación.
 * @param props.creadorId Identificador del creador de la publicación.
 * @param props.estadoPublicacion Estado actual de la publicación.
 * @returns Botón de eliminación o `null` si el usuario no puede eliminar.
 */
export default function EliminarPublicacionButton({
  idPublicacion,
  creadorId,
  estadoPublicacion,
}: EliminarPublicacionButtonProps) {
  const router = useRouter();
  const [puedeEliminar, setPuedeEliminar] = useState(false);
  const [esModeracion, setEsModeracion] = useState(false);
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
        const esCreador = usuario.id === creadorId;
        const esMod =
          usuario.rol === RolUsuario.usuarioModerador ||
          usuario.rol === RolUsuario.usuarioAdministrador;

        setPuedeEliminar(esCreador || esMod);
        setEsModeracion(esMod && !esCreador);
      } catch {
        // Sin permiso visible si falla la verificación
      }
    }

    verificarPermiso();

    return () => {
      activo = false;
    };
  }, [creadorId, estadoPublicacion]);

  const puedeEliminarEnEsteEstado =
    estadoPublicacion === "DISPONIBLE" ||
    estadoPublicacion === "PAUSADA" ||
    esModeracion;

  const eliminar = async () => {
    const confirmar = window.confirm(
      esModeracion
        ? "¿Eliminar esta publicación por moderación? No se va a poder deshacer."
        : "¿Eliminar esta publicación? No se va a poder deshacer.",
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

  if (!puedeEliminar || !puedeEliminarEnEsteEstado) {
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
        {eliminando
          ? "Eliminando..."
          : esModeracion
            ? "Eliminar (moderación)"
            : "Eliminar publicación"}
      </button>
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
