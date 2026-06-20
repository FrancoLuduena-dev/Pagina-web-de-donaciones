"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import estilos from "./MenuUsuario.module.css";
import { RolUsuario } from "@/types/RolUsuario";

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

  const [cantidadNotificaciones, setCantidadNotificaciones] = useState(0);

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
        const token = localStorage.getItem("access_token");

        if (!token) {
          router.push("/login");
          return;
        }

        const respuesta = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!respuesta.ok) {
          throw new Error("No se pudo obtener el usuario");
        }

        const datos = await respuesta.json();

        setUsuario({
          id: datos.id,
          nombreUsuario: datos.nombreUsuario,
          correo: datos.correo,
          rol: datos.rol,
        });
        const solicitudesResponse = await fetch("/api/solicitudes/recibidas", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (solicitudesResponse.ok) {
          const solicitudes = await solicitudesResponse.json();

          console.log("SOLICITUDES RECIBIDAS:", solicitudes);

          const pendientes = solicitudes.filter(
            (solicitud: { estado: string }) => solicitud.estado === "PENDIENTE",
          ).length;

          console.log("PENDIENTES:", pendientes);
          setCantidadNotificaciones(pendientes);
        }
      } catch (error) {
        console.error(error);
      }
    };

    cargarUsuario();

    const intervalo = setInterval( cargarUsuario, 10000 )
    return () => { clearInterval(intervalo) };
  }, [router]);

  const cerrarSesion = () => {
    localStorage.removeItem("access_token");

    router.push("/login");
  };

  if (!usuario) {
    return null;
  }

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

        {cantidadNotificaciones > 0 && (
          <span className={estilos.menuUsuarioBadge}>
            {cantidadNotificaciones}
          </span>
        )}

        <span className={estilos.menuUsuarioFlecha}>▼</span>
      </button>

      {abierto && (
        <div className={estilos.menuUsuarioDropdown}>
          <div className={estilos.menuUsuarioHeader}>
            <strong>{usuario.nombreUsuario}</strong>

            <span>{usuario.correo}</span>
          </div>

          {usuario.rol === RolUsuario.usuarioNormal && (
            <>
              <Link href="/usuario" className={estilos.menuUsuarioItem}>
                Panel de usuario
              </Link>

              <Link
                href="/mis_publicaciones"
                className={estilos.menuUsuarioItem}
              >
                Mis publicaciones
              </Link>

              <Link
                href="/usuario/solicitudes"
                className={estilos.menuUsuarioItem}
              >
                <span>Mis Solicitudes</span>

                {cantidadNotificaciones > 0 && (
                  <span className={estilos.menuUsuarioItemBadge}>
                    {cantidadNotificaciones}
                  </span>
                )}
              </Link>
            </>
          )}

          {(usuario.rol === RolUsuario.usuarioModerador ||
            usuario.rol === RolUsuario.usuarioAdministrador) && (
            <Link href="/denuncias" className={estilos.menuUsuarioItem}>
              Denuncias
            </Link>
          )}

          {usuario.rol === RolUsuario.usuarioAdministrador && (
            <Link href="/gestionRoles" className={estilos.menuUsuarioItem}>
              Gestión de roles de usuario
            </Link>
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
