"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./usuario.module.css";
import TarjetaResumen from "@/components/usuarios/cards/TarjetaResumen/TarjetaResumen";
import BotonLink from "@/components/usuarios/botones/BotonLink";

type Usuario = {
  nombre: string;
  correo: string;
  publicacionesActivas: number;
  solicitudesPendientes: number;
  notificaciones: number;
};

// Pagina principal del usuario autenticado.
export default function UsuarioPage() {
  const router = useRouter();

  // Estado del usuario
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Estado de carga
  const [loading, setLoading] = useState(true);

  // Estado de error
  const [error, setError] = useState("");

  useEffect(() => {
    async function cargarUsuario() {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          router.push("/login");
          return;
        }

        const usuarioResponse = await fetch(
          "/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!usuarioResponse.ok) {
          router.push("/login");
          return;
        }

        const usuarioData =
          await usuarioResponse.json();

        const publicacionesResponse =
          await fetch(
            "/api/publicaciones/mias",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

        let publicacionesActivas = 0;

        if (publicacionesResponse.ok) {
          const publicaciones =
            await publicacionesResponse.json();

          publicacionesActivas =
            publicaciones.length;
        }

        // MOCK_BORRAR
        const solicitudesPendientes = 2;
        const notificaciones = 7;
        // END_MOCK_BORRAR

        setUsuario({
          nombre:
            usuarioData.nombreUsuario,
          correo: usuarioData.correo,
          publicacionesActivas,
          solicitudesPendientes,
          notificaciones,
        });
      } catch {
        setError(
          "Ocurrió un error al cargar el perfil."
        );
      } finally {
        setLoading(false);
      }
    }

    cargarUsuario();
  }, [router]);

  // Pantalla de carga
  if (loading) {
    return (
      <main className={styles.main}>
        <p>Cargando perfil...</p>
      </main>
    );
  }

  // Pantalla de error
  if (error) {
    return (
      <main className={styles.main}>
        <p>{error}</p>
      </main>
    );
  }

  // Seguridad extra
  if (!usuario) {
    return null;
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <section className={styles.header}>
          <div className={styles.avatar}>
            {usuario.nombre
              .charAt(0)
              .toUpperCase()}
          </div>

          <div>
            <h1 className={styles.title}>
              Hola, {usuario.nombre}
            </h1>

            <p className={styles.email}>
              {usuario.correo}
            </p>
          </div>
        </section>

        <section className={styles.summaryGrid}>
          <TarjetaResumen
            titulo="Publicaciones activas"
            valor={
              usuario.publicacionesActivas
            }
          />

          <TarjetaResumen
            titulo="Solicitudes pendientes"
            valor={
              usuario.solicitudesPendientes
            }
          />

          <TarjetaResumen
            titulo="Notificaciones nuevas"
            valor={usuario.notificaciones}
          />
        </section>

        <section className={styles.actions}>
          <h2>Accesos rápidos</h2>

          <div className={styles.buttonGrid}>
            <BotonLink
              href="/usuario/editar"
              texto="Editar perfil"
            />

            <BotonLink
              href="/usuario/publicaciones"
              texto="Mis publicaciones"
            />

            <BotonLink
              href="/usuario/notificaciones"
              texto="Notificaciones"
            />

            <BotonLink
              href="/publicaciones/crear"
              texto="Crear publicación"
            />
          </div>
        </section>
      </div>
    </main>
  );
}