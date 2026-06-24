"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  pausarPublicacionRequest,
  reactivarPublicacionRequest,
} from "@/lib/publicaciones";
import { RolUsuario } from "@/types/RolUsuario";

import styles from "./CambiarEstadoPublicacionButton.module.css";

type CambiarEstadoPublicacionButtonProps = {
  idPublicacion: string;
  creadorId: string;
  estadoPublicacion: string;
};

type UsuarioSesion = {
  id: string;
  rol: RolUsuario;
};

function esModerador(rol: string): boolean {
  return (
    rol === RolUsuario.usuarioModerador ||
    rol === RolUsuario.usuarioAdministrador
  );
}

export default function CambiarEstadoPublicacionButton({
  idPublicacion,
  creadorId,
  estadoPublicacion,
}: CambiarEstadoPublicacionButtonProps) {
  const router = useRouter();
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let activo = true;

    async function cargarUsuario() {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok || !activo) return;

        const data = await res.json();
        setUsuario({ id: data.id, rol: data.rol });
      } catch {
        // Sin botón si falla la verificación
      }
    }

    cargarUsuario();

    return () => {
      activo = false;
    };
  }, []);

  if (!usuario) {
    return null;
  }

  const esCreador = usuario.id === creadorId;
  const esMod = esModerador(usuario.rol);

  if (!esCreador && !esMod) {
    return null;
  }

  const puedePausar = estadoPublicacion === "DISPONIBLE";
  const puedeReactivar = estadoPublicacion === "PAUSADA";

  if (!puedePausar && !puedeReactivar) {
    return null;
  }

  const ejecutar = async () => {
    const esAccionPausar = puedePausar;
    const mensajeConfirmacion = esMod && !esCreador
      ? esAccionPausar
        ? "¿Bloquear esta publicación? Dejará de estar visible en el listado."
        : "¿Reactivar esta publicación?"
      : esAccionPausar
        ? "¿Pausar tu publicación? No recibirá solicitudes hasta que la reactives."
        : "¿Reactivar tu publicación? Volverá a estar disponible.";

    if (!window.confirm(mensajeConfirmacion)) {
      return;
    }

    setError("");
    setProcesando(true);

    try {
      if (esAccionPausar) {
        await pausarPublicacionRequest(idPublicacion);
      } else {
        await reactivarPublicacionRequest(idPublicacion);
      }

      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar el estado de la publicación.",
      );
    } finally {
      setProcesando(false);
    }
  };

  let etiqueta = "Reactivar publicación";

  if (puedePausar) {
    if (esMod && !esCreador) {
      etiqueta = "Bloquear publicación";
    } else {
      etiqueta = "Pausar publicación";
    }
  }

  const claseBoton =
    esMod && !esCreador && puedePausar
      ? `${styles.boton} ${styles.botonModeracion}`
      : styles.boton;

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={claseBoton}
        onClick={ejecutar}
        disabled={procesando}
      >
        {procesando ? "Procesando..." : etiqueta}
      </button>
      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
