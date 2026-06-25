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
  solicitudesPorRevisar: number;
  notificaciones: number;
};

/**
 * Página principal del usuario autenticado.
 * @returns Perfil y accesos rápidos del usuario.
 */
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

        const usuarioResponse = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!usuarioResponse.ok) {
          router.push("/login");
          return;
        }

        const usuarioData = await usuarioResponse.json();

        const publicacionesResponse = await fetch("/api/publicaciones/mias", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        let publicacionesActivas = 0;
        let solicitudesPendientes = 0;
        let solicitudesPorRevisar = 0;

        if (publicacionesResponse.ok) {
          const publicaciones = await publicacionesResponse.json();

          publicacionesActivas = publicaciones.length;
        }

        const solicitudesResponse = await fetch("/api/solicitudes/mias", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (solicitudesResponse.ok) {
          const solicitudes = await solicitudesResponse.json();
          solicitudesPendientes = solicitudes.filter((solicitud: { estado: string }) => solicitud.estado === "PENDIENTE").length;
        }

        const solicitudesRecibidasResponse = await fetch("/api/solicitudes/recibidas", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (solicitudesRecibidasResponse.ok) {
          const solicitudesRecibidas = await solicitudesRecibidasResponse.json();

          solicitudesPorRevisar = solicitudesRecibidas.filter((solicitud: { estado: string }) => solicitud.estado === "PENDIENTE").length;
        }

        setUsuario({
          nombre: usuarioData.nombreUsuario,
          correo: usuarioData.correo,
          publicacionesActivas,
          solicitudesPendientes,
          solicitudesPorRevisar,
          notificaciones: 0,
        });
      } catch (error) {
        console.error(error);
        setError("Ocurrió un error al cargar el perfil.");
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
          <div className={styles.avatar}>{usuario.nombre.charAt(0).toUpperCase()}</div>

          <div>
            <h1 className={styles.title}>Hola, {usuario.nombre}</h1>

            <p className={styles.email}>{usuario.correo}</p>
          </div>
        </section>

        <section className={styles.summaryGrid}>
          <TarjetaResumen titulo="Publicaciones activas" valor={usuario.publicacionesActivas} />

          <TarjetaResumen titulo="Mis Solicitudes pendientes" valor={usuario.solicitudesPendientes} />

          <TarjetaResumen titulo="Solicitudes recibidas pendientes" valor={usuario.solicitudesPorRevisar} />
        </section>

        <section className={styles.actions}>
          <h2>Accesos rápidos</h2>

          <div className={styles.buttonGrid}>
            <BotonLink href="/usuario/editar" texto="Editar perfil" />

            <BotonLink href="/usuario/publicaciones" texto="Mis publicaciones" />

            <BotonLink href="/usuario/notificaciones" texto="Notificaciones" />

            <BotonLink href="/publicaciones/crear" texto="Crear publicación" />
          </div>
        </section>
      </div>
    </main>
  );
}
