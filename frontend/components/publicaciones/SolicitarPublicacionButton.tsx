"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ESTADOS_SOLICITUD_ACTIVA,
  crearSolicitudRequest,
  listarMisSolicitudesRequest,
} from "@/lib/solicitudes";

import styles from "./SolicitarPublicacionButton.module.css";

type SolicitarPublicacionButtonProps = {
  idPublicacion: string;
  creadorId: string;
  estadoPublicacion: string;
};

export default function SolicitarPublicacionButton({
  idPublicacion,
  creadorId,
  estadoPublicacion,
}: SolicitarPublicacionButtonProps) {
  const router = useRouter();
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [esCreador, setEsCreador] = useState(false);
  const [sinSesion, setSinSesion] = useState(false);
  const [yaSolicitada, setYaSolicitada] = useState(false);

  const publicacionDisponible = estadoPublicacion === "DISPONIBLE";

  useEffect(() => {
    let activo = true;

    async function verificarEstado() {
      setCargando(true);
      setError("");
      setSinSesion(false);
      setEsCreador(false);
      setYaSolicitada(false);

      const token = localStorage.getItem("access_token");
      if (!token) {
        if (activo) {
          setSinSesion(true);
          setCargando(false);
        }
        return;
      }

      try {
        const meRes = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!meRes.ok) {
          if (activo) setSinSesion(true);
          return;
        }

        const usuario = await meRes.json();

        if (!activo) return;

        if (usuario.id === creadorId) {
          setEsCreador(true);
          return;
        }

        const solicitudes = await listarMisSolicitudesRequest();
        const tieneActiva = solicitudes.some(
          (solicitud) =>
            solicitud.publicacionId === idPublicacion &&
            ESTADOS_SOLICITUD_ACTIVA.includes(solicitud.estado),
        );

        if (tieneActiva) {
          setYaSolicitada(true);
        }
      } catch {
        if (activo) setError("No se pudo verificar si podés solicitar esta publicación.");
      } finally {
        if (activo) setCargando(false);
      }
    }

    verificarEstado();

    return () => {
      activo = false;
    };
  }, [creadorId, idPublicacion]);

  const enviarSolicitud = async () => {
    setError("");
    setEnviando(true);

    try {
      await crearSolicitudRequest({
        publicacionId: idPublicacion,
        mensaje: mensaje.trim() || undefined,
      });

      setExito(true);
      setMostrarFormulario(false);
      setMensaje("");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo enviar la solicitud.",
      );
    } finally {
      setEnviando(false);
    }
  };

  if (cargando || esCreador || !publicacionDisponible) {
    return null;
  }

  if (sinSesion) {
    return (
      <Link href="/login" className={styles.botonSecundario}>
        Iniciá sesión para solicitar
      </Link>
    );
  }

  if (exito || yaSolicitada) {
    return (
      <div className={styles.wrapper}>
        <p className={styles.exito}>
          {exito ? "¡Solicitud enviada!" : "Ya tenés una solicitud activa."}
        </p>
        <Link href="/usuario/solicitudes" className={styles.linkSolicitudes}>
          Ver mis solicitudes
        </Link>
      </div>
    );
  }

  if (!mostrarFormulario) {
    return (
      <div className={styles.wrapper}>
        <button
          type="button"
          className={styles.boton}
          onClick={() => setMostrarFormulario(true)}
        >
          Solicitar publicación
        </button>
        {error ? <p className={styles.error}>{error}</p> : null}
      </div>
    );
  }

  return (
    <div className={styles.formulario}>
      <label className={styles.label}>
        Mensaje (opcional)
        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={3}
          maxLength={255}
          placeholder="Contale al donante por qué lo necesitás..."
          className={styles.textarea}
        />
      </label>

      <div className={styles.acciones}>
        <button
          type="button"
          className={styles.boton}
          onClick={enviarSolicitud}
          disabled={enviando}
        >
          {enviando ? "Enviando..." : "Confirmar solicitud"}
        </button>
        <button
          type="button"
          className={styles.botonSecundario}
          onClick={() => {
            setMostrarFormulario(false);
            setMensaje("");
            setError("");
          }}
          disabled={enviando}
        >
          Cancelar
        </button>
      </div>

      {error ? <p className={styles.error}>{error}</p> : null}
    </div>
  );
}
