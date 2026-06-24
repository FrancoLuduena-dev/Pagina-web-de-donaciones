"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import estilos from "./MenuUsuario.module.css";
import { RolUsuario } from "@/types/RolUsuario";
import {
  clearSession,
  getAccessToken,
  obtenerUsuarioActualRequest,
} from "@/lib/auth";

interface UsuarioNavbar {
  id: string;
  nombreUsuario: string;
  correo: string;
  rol: RolUsuario;
  fotoPerfil?: string;
}

export default function MenuUsuario() {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioNavbar | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [cantidadPendientes, setCantidadPendientes] = useState(0);
  const [cantidadNoLeidas, setCantidadNoLeidas] = useState(0);
  const [cantidadDenunciasPendientes, setCantidadDenunciasPendientes] =
    useState(0);

  useEffect(() => {
    const cerrarMenu = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAbierto(false);
      }
    };

    document.addEventListener("mousedown", cerrarMenu);

    return () => {
      document.removeEventListener("mousedown", cerrarMenu);
    };
  }, []);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const datos = await obtenerUsuarioActualRequest();

        if (!datos) {
          if (!getAccessToken()) {
            router.replace("/login");
          }
          return;
        }

        setUsuario({
          id: datos.id,
          nombreUsuario: datos.nombreUsuario,
          correo: datos.correo,
          rol: datos.rol as RolUsuario,
        });

        const token = localStorage.getItem("access_token");
        if (!token) {
          return;
        }

        const solicitudesResponse = await fetch("/api/solicitudes/recibidas", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (solicitudesResponse.ok) {
          const solicitudes = await solicitudesResponse.json();

          const publicacionesConAceptada = new Set(
            solicitudes
              .filter(
                (solicitud: { estado: string }) =>
                  solicitud.estado === "ACEPTADA",
              )
              .map(
                (solicitud: { publicacionId: string }) =>
                  solicitud.publicacionId,
              ),
          );

          const pendientes = solicitudes.filter(
            (solicitud: { estado: string; publicacionId: string }) =>
              solicitud.estado === "PENDIENTE" &&
              !publicacionesConAceptada.has(solicitud.publicacionId),
          ).length;

          setCantidadPendientes(pendientes);
        }

        const notificacionesResponse = await fetch(
          "/api/notificaciones/no-leidas/cantidad",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (notificacionesResponse.ok) {
          const datosNotificaciones = await notificacionesResponse.json();

          setCantidadNoLeidas(datosNotificaciones.cantidad ?? 0);
        }
        if (
          datos.rol === RolUsuario.usuarioModerador ||
          datos.rol === RolUsuario.usuarioAdministrador
        ) {
          const denunciasResponse = await fetch("/api/denuncias", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (denunciasResponse.ok) {
            const denuncias = await denunciasResponse.json();

            const pendientes = denuncias.filter(
              (denuncia: { estado: string }) => denuncia.estado === "PENDIENTE",
            ).length;

            setCantidadDenunciasPendientes(pendientes);
          }
        }
      } catch {
        // Fallo transitorio al cargar datos del menú; se reintenta en el intervalo.
      }
    };

    cargarUsuario();

    const intervalo = setInterval(cargarUsuario, 10000);
    return () => {
      clearInterval(intervalo);
    };
  }, [router]);

  const cerrarSesion = () => {
    clearSession();
    router.push("/login");
  };

  if (!usuario) {
    return null;
  }

  const cantidadTotal =
    cantidadPendientes + cantidadNoLeidas + cantidadDenunciasPendientes;

  return (
    <div className={estilos.menuUsuario} ref={menuRef}>
      <button
        type="button"
        className={estilos.menuUsuarioBoton}
        onClick={() => setAbierto(!abierto)}
      >
        <div className={estilos.menuUsuarioAvatar}>
          {usuario.nombreUsuario.charAt(0).toUpperCase()}
        </div>

        <span className={estilos.menuUsuarioNombre}>
          {usuario.nombreUsuario}
        </span>

        {cantidadTotal > 0 && (
          <span className={estilos.menuUsuarioBadge}>{cantidadTotal}</span>
        )}

        <span className={estilos.menuUsuarioFlecha}>▼</span>
      </button>

      {abierto && (
        <div className={estilos.menuUsuarioDropdown}>
          <div className={estilos.menuUsuarioHeader}>
            <strong>{usuario.nombreUsuario}</strong>

            <span>{usuario.correo}</span>
          </div>

         {usuario.rol === RolUsuario.usuarioAdministrador && (
            <Link href="/gestionRoles" className={estilos.menuUsuarioItem}>
              Gestión de roles de usuario
            </Link>
          )}


         {(usuario.rol === RolUsuario.usuarioModerador ||
            usuario.rol === RolUsuario.usuarioAdministrador) && (
            <Link href="/denuncias" className={estilos.menuModItem}>
              <span>Denuncias</span>

              {cantidadDenunciasPendientes > 0 && (
                <span className={estilos.menuUsuarioItemBadge}>
                  {cantidadDenunciasPendientes}
                </span>
              )}
            </Link>
          )}




          {usuario && (
            <>
              <Link href="/usuario" className={estilos.menuUsuarioItem}>
                Panel de usuario
              </Link>

              <Link
                href="/usuario/publicaciones"
                className={estilos.menuUsuarioItem}
              >
                Mis publicaciones
              </Link>

              <Link
                href="/usuario/solicitudes"
                className={estilos.menuUsuarioItem}
              >
                <span>Mis Solicitudes</span>

                {cantidadPendientes > 0 && (
                  <span className={estilos.menuUsuarioItemBadge}>
                    {cantidadPendientes}
                  </span>
                )}
              </Link>

              <Link
                href="/usuario/notificaciones"
                className={estilos.menuUsuarioItem}
              >
                <span>Notificaciones</span>

                {cantidadNoLeidas > 0 && (
                  <span className={estilos.menuUsuarioItemBadge}>
                    {cantidadNoLeidas}
                  </span>
                )}
              </Link>
            </>
          )}

          <Link href="/usuario/editar" className={estilos.menuUsuarioItem}>
            Editar Perfil
          </Link>

          <button
            type="button"
            className={estilos.menuUsuarioLogout}
            onClick={cerrarSesion}
          >
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
