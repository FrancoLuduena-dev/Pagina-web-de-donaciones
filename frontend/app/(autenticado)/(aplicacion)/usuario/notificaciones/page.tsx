"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./notificaciones.module.css";

type Notificacion = {
  id: string;
  tipo: string;
  titulo: string;
  mensaje: string;
  leida: boolean;
  leidaEn?: string | null;
  solicitudId?: string | null;
  publicacionId?: string | null;
  denunciaId?: string | null;
  creadaEn: string;
};

type RespuestaNotificaciones = {
  notificaciones: Notificacion[];
};

/**
 * Página de notificaciones del usuario.
 * @returns Lista de notificaciones del usuario.
 */
export default function NotificacionesPage() {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarNotificaciones() {
      try {
        const token = localStorage.getItem("access_token");

        const respuesta = await fetch("/api/notificaciones", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!respuesta.ok) {
          throw new Error();
        }

        const datos: RespuestaNotificaciones = await respuesta.json();

        setNotificaciones(datos.notificaciones ?? []);
      } catch {
        setError("No se pudieron cargar las notificaciones.");
      } finally {
        setCargando(false);
      }
    }

    cargarNotificaciones();
  }, []);

  async function marcarComoLeida(notificacionId: string) {
    try {
      const token = localStorage.getItem("access_token");

      const respuesta = await fetch(`/api/notificaciones/${notificacionId}/marcar-leida`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        throw new Error();
      }

      setNotificaciones(
        notificaciones.map((notificacion) =>
          notificacion.id === notificacionId
            ? {
                ...notificacion,
                leida: true,
              }
            : notificacion,
        ),
      );
    } catch {
      alert("No se pudo marcar la notificación.");
    }
  }

  async function marcarTodasComoLeidas() {
    try {
      const token = localStorage.getItem("access_token");

      const respuesta = await fetch("/api/notificaciones/marcar-todas-leidas", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        throw new Error();
      }

      setNotificaciones(
        notificaciones.map((notificacion) => ({
          ...notificacion,
          leida: true,
        })),
      );
    } catch {
      alert("No se pudieron marcar las notificaciones.");
    }
  }

  if (cargando) {
    return (
      <main className={styles.main}>
        <p>Cargando notificaciones...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.main}>
        <p>{error}</p>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.titulo}>Mis notificaciones</h1>

          {notificaciones.length > 0 && (
            <button type="button" className={styles.botonTodas} onClick={marcarTodasComoLeidas}>
              Marcar todas como leídas
            </button>
          )}
        </div>

        {notificaciones.length === 0 ? (
          <div className={styles.vacio}>No tienes notificaciones.</div>
        ) : (
          <div className={styles.lista}>
            {notificaciones.map((notificacion) => (
              <article key={notificacion.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <span className={`${styles.estado} ${notificacion.leida ? styles.estadoLeida : styles.estadoNueva}`}>{notificacion.leida ? "Leída" : "Nueva"}</span>
                </div>

                <h2 className={styles.cardTitulo}>{notificacion.titulo}</h2>

                <p>{notificacion.mensaje}</p>

                <p className={styles.fecha}>{new Date(notificacion.creadaEn).toLocaleDateString()}</p>

                <div className={styles.acciones}>
                  {notificacion.solicitudId && (
                    <Link href="/usuario/solicitudes" className={styles.link}>
                      Ver solicitud
                    </Link>
                  )}

                  {notificacion.publicacionId && (
                    <Link href={`/publicaciones/publicacion/${notificacion.publicacionId}`} className={styles.link}>
                      Ver publicación
                    </Link>
                  )}

                  {!notificacion.leida && (
                    <button type="button" className={styles.botonLeida} onClick={() => marcarComoLeida(notificacion.id)}>
                      Marcar como leída
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
