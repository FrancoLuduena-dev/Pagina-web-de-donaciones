"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import PublicacionCard from "@/components/PublicacionCard";
import { mapPublicacionBackendToResumen } from "@/constants/publicacionesBackend";
import { listarMisPublicacionesRequest } from "@/lib/publicaciones";
import type { PublicacionResumen } from "@/types/PublicacionResumen";
import { EstadoPublicacion } from "@/types/EstadoPublicacion";

import styles from "./publicaciones.module.css";

const FILTROS = [
  { label: "Todas", value: "" },
  { label: "Disponibles", value: "DISPONIBLE" },
  { label: "Pausadas", value: "PAUSADA" },
  { label: "Reservadas", value: "RESERVADA" },
  { label: "Entregadas", value: "ENTREGADA" },
  { label: "Eliminadas", value: "ELIMINADA" },
] as const;

/**
 * Página de historial de publicaciones del usuario.
 * @returns Vista del historial de publicaciones del usuario.
 */
export default function MisPublicacionesPage() {
  const router = useRouter();
  const [publicaciones, setPublicaciones] = useState<PublicacionResumen[]>([]);
  const [filtroEstado, setFiltroEstado] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const cargarPublicaciones = useCallback(async (estado: string) => {
    setCargando(true);
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const data = await listarMisPublicacionesRequest(estado || undefined);
      setPublicaciones(data.map(mapPublicacionBackendToResumen));
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : "No se pudieron cargar tus publicaciones.";
      setError(mensaje);
      setPublicaciones([]);
    } finally {
      setCargando(false);
    }
  }, [router]);

  useEffect(() => {
    void cargarPublicaciones(filtroEstado);
  }, [cargarPublicaciones, filtroEstado]);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.titulo}>Mis publicaciones</h1>
          <Link href="/publicaciones/crear" className={styles.crearButton}>
            + Crear publicación
          </Link>
        </div>

        <p className={styles.descripcion}>
          Acá podés ver todo tu historial: activas, pausadas, reservadas,
          entregadas y eliminadas.
        </p>

        <div className={styles.filtros} role="tablist" aria-label="Filtrar por estado">
          {FILTROS.map((filtro) => (
            <button
              key={filtro.value || "todas"}
              type="button"
              role="tab"
              aria-selected={filtroEstado === filtro.value}
              className={`${styles.filtro} ${
                filtroEstado === filtro.value ? styles.filtroActivo : ""
              }`}
              onClick={() => setFiltroEstado(filtro.value)}
            >
              {filtro.label}
            </button>
          ))}
        </div>

        {cargando ? (
          <p className={styles.descripcion}>Cargando publicaciones...</p>
        ) : error ? (
          <p className={`${styles.descripcion} ${styles.error}`}>{error}</p>
        ) : publicaciones.length === 0 ? (
          <div className={styles.vacio}>
            <p>
              {filtroEstado
                ? "No tenés publicaciones con ese estado."
                : "Todavía no publicaste nada."}
            </p>
            {!filtroEstado ? (
              <Link href="/publicaciones/crear" className={styles.crearButton}>
                Crear tu primera publicación
              </Link>
            ) : null}
          </div>
        ) : (
          <>
            <p className={styles.descripcion}>
              {publicaciones.length} publicación
              {publicaciones.length === 1 ? "" : "es"}
              {filtroEstado ? " en este filtro" : " en total"}.
            </p>
            <div className={styles.grid}>
              {publicaciones.map((publicacion) => (
                <PublicacionCard
                  key={publicacion.idPublicacion}
                  publicacion={publicacion}
                  href={
                    publicacion.estadoPublicacion === EstadoPublicacion.ELIMINADO
                      ? null
                      : undefined
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
