"use client";

import { useEffect, useState } from "react";

import DenunciaCard from "@/components/denuncias/DenunciaCard";
import { obtenerDenuncias, tomarDenuncia } from "@/lib/denuncias";
import { Denuncia } from "@/types/Denuncia";
import { RolUsuario } from "@/types/RolUsuario";
import styles from "./denuncias.module.css";

interface UsuarioActual {
  id: string;
  rol: RolUsuario;
}

export default function PaginaDenuncias() {
  const [usuario, setUsuario] =
    useState<UsuarioActual | null>(null);

  const [denuncias, setDenuncias] =
    useState<Denuncia[]>([]);

  const [cargando, setCargando] =
    useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const token =
          localStorage.getItem(
            "access_token",
          );

        if (!token) {
          return;
        }

        const usuarioResponse =
          await fetch("/api/auth/me", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

        const usuarioData =
          await usuarioResponse.json();

        setUsuario(usuarioData);

        const denunciasData =
          await obtenerDenuncias(token);

        setDenuncias(denunciasData);
      } catch (error) {
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  if (cargando) {
    return <p>Cargando denuncias...</p>;
  }

  if (!usuario) {
    return null;
  }

  const esAdministrador =
    usuario.rol ===
    RolUsuario.usuarioAdministrador;

  const denunciasDisponibles =
    denuncias.filter(
      (denuncia) =>
        denuncia.estado ===
        "PENDIENTE",
    );

  const misDenuncias =
    denuncias.filter(
      (denuncia) =>
        denuncia.estado ===
        "EN_REVISION" &&
        denuncia.moderadorAsignadoId ===
        usuario.id,
    );

  const manejarTomarDenuncia = async (
    denuncia: Denuncia,
  ) => {
    try {
      const token =
        localStorage.getItem(
          "access_token",
        );

      if (!token) {
        return;
      }

      await tomarDenuncia(
        denuncia.id,
        denuncia.version,
        token,
      );

      const denunciasActualizadas =
        await obtenerDenuncias(token);

      setDenuncias(
        denunciasActualizadas,
      );
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.titulo}>
        Denuncias
      </h1>

      {esAdministrador ? (
        <section className={styles.seccion}>
          <h2 className={styles.seccionTitulo}>
            Todas las denuncias
          </h2>

          <div className={styles.grid}>
            {denuncias.length > 0 ? (
              denuncias.map((denuncia) => (
                <DenunciaCard
                  key={denuncia.id}
                  denuncia={denuncia}
                  mostrarBotonTomar={
                    denuncia.estado ===
                    "PENDIENTE"
                  }
                  onTomar={() =>
                    manejarTomarDenuncia(
                      denuncia,
                    )
                  }
                />
              ))
            ) : (
              <p className={styles.vacio}>
                No hay denuncias registradas.
              </p>
            )}
          </div>
        </section>
      ) : (
        <>
          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>
              Denuncias disponibles
            </h2>

            <div className={styles.grid}>
              {denunciasDisponibles.length > 0 ? (
                denunciasDisponibles.map(
                  (denuncia) => (
                    <DenunciaCard
                      key={denuncia.id}
                      denuncia={denuncia}
                      mostrarBotonTomar
                      onTomar={() =>
                        manejarTomarDenuncia(
                          denuncia,
                        )
                      }
                    />
                  ),
                )
              ) : (
                <p className={styles.vacio}>
                  No hay denuncias disponibles.
                </p>
              )}
            </div>
          </section>

          <section className={styles.seccion}>
            <h2 className={styles.seccionTitulo}>
              Mis denuncias
            </h2>

            <div className={styles.grid}>
              {misDenuncias.length > 0 ? (
                misDenuncias.map(
                  (denuncia) => (
                    <DenunciaCard
                      key={denuncia.id}
                      denuncia={denuncia}
                    />
                  ),
                )
              ) : (
                <p className={styles.vacio}>
                  No tienes denuncias asignadas.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </main>
  );
}