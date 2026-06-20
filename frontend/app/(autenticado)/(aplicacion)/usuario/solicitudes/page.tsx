"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./solicitudes.module.css";

type Solicitud = {
  id: string;
  publicacionId: string;
  solicitanteId?: string;
  creadorPublicacionId?: string;
  mensaje?: string;
  estado: string;
  motivoRechazo?: string;
  nombreUsuario?: string;
  correo?: string;
  numeroTelefono?: string;
  createdAt: string;
  updatedAt: string;
};

export default function SolicitudesPage() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [solicitudesRecibidas, setSolicitudesRecibidas] = useState<Solicitud[]>(
    [],
  );
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [motivosRechazo, setMotivosRechazo] = useState<Record<string, string>>(
    {},
  );

  const titulo = "Mis solicitudes";

  useEffect(() => {
    async function cargarSolicitudes() {
      try {
        const token = localStorage.getItem("access_token");

        const respuesta = await fetch("/api/solicitudes/mias", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!respuesta.ok) {
          throw new Error();
        }

        const datos = await respuesta.json();

        const respuestaRecibidas = await fetch("/api/solicitudes/recibidas", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let datosRecibidas: Solicitud[] = [];

        if (respuestaRecibidas.ok) {
          datosRecibidas = await respuestaRecibidas.json();
        }

        setSolicitudes(datos);
        setSolicitudesRecibidas(datosRecibidas);
      } catch {
        setError("No se pudieron cargar las solicitudes.");
      } finally {
        setCargando(false);
      }
    }

    cargarSolicitudes();
  }, []);

  async function aceptarSolicitud(solicitudId: string) {
    try {
      const token = localStorage.getItem("access_token");

      const respuesta = await fetch(`/api/solicitudes/${solicitudId}/aceptar`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!respuesta.ok) {
        throw new Error();
      }

      setSolicitudesRecibidas(
        solicitudesRecibidas.map((solicitud) =>
          solicitud.id === solicitudId
            ? {
              ...solicitud,
              estado: "ACEPTADA",
            }
            : solicitud,
        ),
      );
    } catch {
      alert("No se pudo aceptar la solicitud.");
    }
  }

  async function rechazarSolicitud(solicitudId: string) {
    try {
      const token = localStorage.getItem("access_token");

      const respuesta = await fetch(
        `/api/solicitudes/${solicitudId}/rechazar`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            motivo: motivosRechazo[solicitudId] ?? "",
          }),
        },
      );

      if (!respuesta.ok) {
        throw new Error();
      }

      setSolicitudesRecibidas(
        solicitudesRecibidas.map((solicitud) =>
          solicitud.id === solicitudId
            ? {
              ...solicitud,
              estado: "RECHAZADA",
            }
            : solicitud,
        ),
      );
    } catch {
      alert("No se pudo rechazar la solicitud.");
    }
  }

  async function cancelarSolicitud(solicitudId: string) {
    try {
      const token = localStorage.getItem("access_token");

      const respuesta = await fetch(
        `/api/solicitudes/${solicitudId}/cancelar`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            motivo: "",
          }),
        },
      );

      if (!respuesta.ok) {
        throw new Error();
      }

      setSolicitudes(
        solicitudes.map((solicitud) =>
          solicitud.id === solicitudId
            ? {
              ...solicitud,
              estado: "CANCELADA",
            }
            : solicitud,
        ),
      );
    } catch {
      alert("No se pudo cancelar la solicitud.");
    }
  }

  if (cargando) {
    return (
      <main className={styles.main}>
        <p>Cargando solicitudes...</p>
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
        <h1 className={styles.titulo}>{titulo}</h1>

        {/* SECCIÓN: SOLICITUDES REALIZADAS POR EL USUARIO */}
        <section>
          <h2 className={styles.subtitulo}>Solicitudes realizadas</h2>

          {solicitudes.length === 0 ? (
            <div className={styles.vacio}>No realizaste solicitudes.</div>
          ) : (
            <div className={styles.lista}>
              {solicitudes.map((solicitud) => (
                <article key={solicitud.id} className={styles.card}>
                  <div className={styles.header}>
                    <span
                      className={`${styles.estado} ${solicitud.estado === "ACEPTADA"
                        ? styles.estadoAceptada
                        : solicitud.estado === "RECHAZADA"
                          ? styles.estadoRechazada
                          : solicitud.estado === "CANCELADA"
                            ? styles.estadoCancelada
                            : styles.estadoPendiente
                        }`}
                    >
                      {solicitud.estado}
                    </span>
                  </div>

                  <div className={styles.contenido}>
                    <p>
                      <strong>Publicación:</strong>{" "}
                      <Link
                        href={`/publicaciones/publicacion/${solicitud.publicacionId}`}
                      >
                        Ver publicación
                      </Link>
                    </p>

                    {solicitud.mensaje && (
                      <p>
                        <strong>Mensaje:</strong> {solicitud.mensaje}
                      </p>
                    )}

                    <p>
                      <strong>Fecha:</strong>{" "}
                      {new Date(solicitud.createdAt).toLocaleDateString()}
                    </p>
                    {solicitud.estado === "RECHAZADA" && (
                      <p>
                        <strong>Motivo de rechazo:</strong>{" "}
                        {solicitud.motivoRechazo?.trim() ||
                          "No se dio motivo de rechazo."}
                      </p>
                    )}
                    {solicitud.estado === "ACEPTADA" && (
                      <>
                        <p>
                          <strong>Nombre:</strong> {solicitud.nombreUsuario}
                        </p>

                        <p>
                          <strong>Correo:</strong> {solicitud.correo}
                        </p>

                        <p>
                          <strong>Teléfono:</strong> {solicitud.numeroTelefono}
                        </p>
                      </>
                    )}
                    {solicitud.estado === "PENDIENTE" && (
                      <div className={styles.acciones}>
                        <button
                          type="button"
                          className={styles.botonCancelar}
                          onClick={() => cancelarSolicitud(solicitud.id)}
                        >
                          Cancelar solicitud
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* SECCIÓN: SOLICITUDES RECIBIDAS EN MIS PUBLICACIONES */}
        <section>
          <h2 className={styles.subtitulo}>Solicitudes de mis publicaciones</h2>

          {solicitudesRecibidas.length === 0 ? (
            <div className={styles.vacio}>
              Ninguna de tus publicaciones tiene solicitudes.
            </div>
          ) : (
            <div className={styles.lista}>
              {solicitudesRecibidas.map((solicitud) => (
                <article key={solicitud.id} className={styles.card}>
                  <div className={styles.header}>
                    <span
                      className={`${styles.estado} ${solicitud.estado === "ACEPTADA"
                        ? styles.estadoAceptada
                        : solicitud.estado === "RECHAZADA"
                          ? styles.estadoRechazada
                          : solicitud.estado === "CANCELADA"
                            ? styles.estadoCancelada
                            : styles.estadoPendiente
                        }`}
                    >
                      {solicitud.estado}
                    </span>
                  </div>

                  <div className={styles.contenido}>
                    <p>
                      <strong>Publicación:</strong>{" "}
                      <Link
                        href={`/publicaciones/publicacion/${solicitud.publicacionId}`}
                      >
                        Ver publicación
                      </Link>
                    </p>

                    {solicitud.mensaje && (
                      <p>
                        <strong>Mensaje:</strong> {solicitud.mensaje}
                      </p>
                    )}

                    <p>
                      <strong>Fecha:</strong>{" "}
                      {new Date(solicitud.createdAt).toLocaleDateString()}
                    </p>
                    {solicitud.estado === "RECHAZADA" && (
                      <p>
                        <strong>Motivo de rechazo:</strong>{" "}
                        {solicitud.motivoRechazo?.trim() ||
                          "No se dio motivo de rechazo."}
                      </p>
                    )}

                    {solicitud.estado === "ACEPTADA" && (
                      <>
                        <p>
                          <strong>Nombre:</strong> {solicitud.nombreUsuario}
                        </p>

                        <p>
                          <strong>Correo:</strong> {solicitud.correo}
                        </p>

                        <p>
                          <strong>Teléfono:</strong> {solicitud.numeroTelefono}
                        </p>
                      </>
                    )}
                    {solicitud.estado === "PENDIENTE" && (
                      <div className={styles.acciones}>
                        <button
                          type="button"
                          className={styles.botonAceptar}
                          onClick={() => aceptarSolicitud(solicitud.id)}
                        >
                          Aceptar
                        </button>

                        <div className={styles.inputConBoton}>
                          <input
                            type="text"
                            placeholder="Motivo de rechazo (opcional)"
                            value={motivosRechazo[solicitud.id] ?? ""}
                            onChange={(e) =>
                              setMotivosRechazo({
                                ...motivosRechazo,
                                [solicitud.id]: e.target.value,
                              })
                            }
                            className={styles.inputMotivo}
                          />

                          <button
                            type="button"
                            className={styles.botonRechazar}
                            onClick={() => rechazarSolicitud(solicitud.id)}
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
