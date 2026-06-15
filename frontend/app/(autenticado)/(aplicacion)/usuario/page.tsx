"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./usuario.module.css";
import TarjetaResumen from "@/components/usuarios/cards/TarjetaResumen/TarjetaResumen";
import BotonLink from "@/components/usuarios/botones/BotonLink";

/* REVISAR CON BACKEND
import { getToken, logout } from "@/lib/auth";
*/

type Usuario = {
  nombre: string;
  correo: string;
  publicacionesActivas?: number;
  solicitudesPendientes?: number;
  notificaciones?: number;
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
        /* REVISAR CON BACKEND
        // Obtener JWT
        const token = getToken();

        // Si no existe token
        if (!token) {
            router.push("/login");
            return;
        }

        // Obtener datos del usuario
        const usuarioResponse = await fetch(
            "http://localhost:3000/api/usuario/me",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type":
                        "application/json",
                },
            }
        );

        // Obtener publicaciones del usuario
        const publicacionesResponse = await fetch(
            "http://localhost:3000/publicaciones/me",
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type":
                        "application/json",
                },
            }
        );

        if (
            !usuarioResponse.ok ||
            !publicacionesResponse.ok
        ) {
            logout();
            router.push("/login");
            return;
        }

        const usuarioData =
            await usuarioResponse.json();

        const publicacionesData =
            await publicacionesResponse.json();

        const publicacionesActivas =
            publicacionesData.filter(
                (
                    publicacion: {
                        estado: string;
                    }
                ) =>
                    publicacion.estado ===
                    "DISPONIBLE"
            ).length;

        setUsuario({
            ...usuarioData,
            publicacionesActivas,
        });
        */

        // MOCK_BORRAR
        // Simular carga
        await new Promise((resolve) => setTimeout(resolve, 500));

        const data = {
          nombre: "Marcelo",
          correo: "marcelo@gmail.com",
          publicacionesActivas: 5,
          solicitudesPendientes: 2,
          notificaciones: 7,
        };

        // END_MOCK_BORRAR

        setUsuario(data);
      } catch {
        setError("Ocurrio un error al cargar el perfil.");
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
          <div className={styles.avatar}>{usuario.nombre.charAt(0)}</div>
          <div>
            <h1 className={styles.title}>Hola, {usuario.nombre}</h1>
            <p className={styles.email}>{usuario.correo}</p>
          </div>
        </section>
        <section className={styles.summaryGrid}>
          <TarjetaResumen
            titulo="Publicaciones activas"
            valor={usuario.publicacionesActivas ?? 0}
          />

          <TarjetaResumen
            titulo="Solicitudes pendientes"
            valor={usuario.solicitudesPendientes ?? 0}
          />

          <TarjetaResumen
            titulo="Notificaciones nuevas"
            valor={usuario.notificaciones ?? 0}
          />
        </section>

        <section className={styles.actions}>
          <h2>Accesos rapidos</h2>
          <div className={styles.buttonGrid}>
            <BotonLink href="/usuario/editar" texto="Editar perfil" />

            <BotonLink
              href="/usuario/publicaciones"  texto="Mis publicaciones" />

            <BotonLink href="/usuario/notificaciones" texto="Notificaciones" />

            <BotonLink href="/publicaciones/crear" texto="Crear Publicacion" />
          </div>
        </section>
      </div>
    </main>
  );
}
