"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
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
  const [abierto, setAbierto] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // MOCK_BORRAR
  const usuario: UsuarioNavbar = {
    id: "1",
    nombreUsuario: "Marcelo",
    correo: "marcelo@gmail.com",
    // Cambiar para probar menú de usuario
    rol: RolUsuario.usuarioAdministrador,

    // rol: RolUsuario.usuarioModerador,
    // rol: RolUsuario.usuarioAdministrador,

    // END_MOCK_BORRAR
  };

  const cantidadNotificaciones = 3;

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

  /*
  const [usuario, setUsuario] = useState<UsuarioNavbar | null>(null);
  const [cantidadNotificaciones, setCantidadNotificaciones] = useState(0);

  useEffect(() => {
    const cargarUsuario = async () => {
      const token = localStorage.getItem('token');

      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/usuario/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const datos = await respuesta.json();

      setUsuario(datos);
    };

    cargarUsuario();
  }, []);
  */

  /*
  useEffect(() => {
    const cargarNotificaciones = async () => {
      const token = localStorage.getItem('token');

      const respuesta = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notificaciones`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const datos = await respuesta.json();

      const sinLeer = datos.filter(
        (notificacion: any) => !notificacion.leida,
      ).length;

      setCantidadNotificaciones(sinLeer);
    };

    cargarNotificaciones();
  }, []);
  */

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
            <Link href="/usuario" className={estilos.menuUsuarioItem}>
              Panel de usuario
            </Link>
          )}

          {usuario.rol === RolUsuario.usuarioNormal && (
            <>
              <Link
                href="/mis_publicaciones"
                className={estilos.menuUsuarioItem}
              >
                Mis publicaciones
              </Link>

              <Link href="/notificaciones" className={estilos.menuUsuarioItem}>
                <span>Notificaciones</span>

                {cantidadNotificaciones > 0 && (
                  <span className={estilos.menuUsuarioItemBadge}>
                    {cantidadNotificaciones}
                  </span>
                )}
              </Link>
            </>
          )}

          {usuario.rol === RolUsuario.usuarioAdministrador && (
            <Link href="/moderacion" className={estilos.menuUsuarioItem}>
              Moderación
            </Link>
          )}

          {usuario.rol !== RolUsuario.usuarioNormal && (
            <Link href="/denuncias" className={estilos.menuUsuarioItem}>
              Denuncias
            </Link>
          )}

          <Link href="/configuracion" className={estilos.menuUsuarioItem}>
            Configuración
          </Link>
          <button type="button" className={estilos.menuUsuarioLogout}>
            Cerrar sesión
            {/*
            const token = localStorage.getItem('token');

            await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/logout`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            localStorage.removeItem('token');

            router.push('/');
            */}
          </button>
        </div>
      )}
    </div>
  );
}
