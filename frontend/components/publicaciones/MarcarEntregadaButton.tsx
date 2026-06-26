"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { entregarPublicacionRequest } from "@/lib/solicitudes";

import styles from "./CambiarEstadoPublicacionButton.module.css";

type MarcarEntregadaButtonProps = {
  idPublicacion: string;
  creadorId: string;
  estadoPublicacion: string;
};

/**
 * Botón para marcar una publicación reservada como entregada.
 *
 * Solo se muestra al creador y únicamente cuando la publicación está reservada.
 * Pide confirmación y, al confirmar, marca la entrega y refresca la vista.
 *
 * @param props Propiedades del componente.
 * @param props.idPublicacion Identificador de la publicación.
 * @param props.creadorId Identificador del creador de la publicación.
 * @param props.estadoPublicacion Estado actual de la publicación.
 * @returns Botón de entrega o `null` si no corresponde mostrarlo.
 */
export default function MarcarEntregadaButton({
  idPublicacion,
  creadorId,
  estadoPublicacion,
}: MarcarEntregadaButtonProps) {
  const router = useRouter();
  const [puedeMarcar, setPuedeMarcar] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function verificarPermiso() {
      if (estadoPublicacion !== "RESERVADA") {
        if (activo) setPuedeMarcar(false);
        return;
      }

      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok || !activo) return;

        const usuario = await res.json();
        setPuedeMarcar(usuario.id === creadorId);
      } catch {
        // Sin botón si falla la verificación
      }
    }

    verificarPermiso();

    return () => {
      activo = false;
    };
  }, [creadorId, estadoPublicacion]);

  const marcarEntregada = async () => {
    const confirmar = window.confirm(
      "¿Confirmás que el objeto ya fue entregado? La publicación pasará a estado entregada.",
    );

    if (!confirmar) return;

    setError("");
    setProcesando(true);

    try {
      await entregarPublicacionRequest(idPublicacion);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo marcar la publicación como entregada.",
      );
    } finally {
      setProcesando(false);
    }
  };

  if (estadoPublicacion !== "RESERVADA" || !puedeMarcar) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={`${styles.boton} ${styles.botonEntregada}`}
        onClick={marcarEntregada}
        disabled={procesando}
      >
        {procesando ? "Procesando..." : "Marcar como entregada"}
      </button>
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
