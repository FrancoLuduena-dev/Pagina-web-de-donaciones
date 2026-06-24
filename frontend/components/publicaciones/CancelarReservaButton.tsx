"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { cancelarReservaPublicacionRequest } from "@/lib/solicitudes";

import styles from "./CambiarEstadoPublicacionButton.module.css";

type CancelarReservaButtonProps = {
  idPublicacion: string;
  creadorId: string;
  estadoPublicacion: string;
};

export default function CancelarReservaButton({
  idPublicacion,
  creadorId,
  estadoPublicacion,
}: CancelarReservaButtonProps) {
  const router = useRouter();
  const [puedeCancelar, setPuedeCancelar] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function verificarPermiso() {
      if (estadoPublicacion !== "RESERVADA") {
        if (activo) setPuedeCancelar(false);
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
        setPuedeCancelar(usuario.id === creadorId);
      } catch {
        // Sin botón si falla la verificación
      }
    }

    verificarPermiso();

    return () => {
      activo = false;
    };
  }, [creadorId, estadoPublicacion]);

  const cancelarReserva = async () => {
    const confirmar = window.confirm(
      "¿Cancelar la reserva? La publicación volverá a estar disponible.",
    );

    if (!confirmar) return;

    setError("");
    setProcesando(true);

    try {
      await cancelarReservaPublicacionRequest(idPublicacion);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cancelar la reserva.",
      );
    } finally {
      setProcesando(false);
    }
  };

  if (estadoPublicacion !== "RESERVADA" || !puedeCancelar) {
    return null;
  }

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.boton}
        onClick={cancelarReserva}
        disabled={procesando}
      >
        {procesando ? "Procesando..." : "Cancelar reserva"}
      </button>
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
