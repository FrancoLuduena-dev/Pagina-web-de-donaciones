"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import styles from "./moderacion.module.css";

import Footer from "@/components/layout/footer/Footer";
import Navbar from "@/components/layout/navbar/Navbar";

import {
  getAccessToken,
  obtenerUsuarioActualRequest,
} from "@/lib/auth";

import { RolUsuario } from "@/types/RolUsuario";

export default function LayoutModerador({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [autorizado, setAutorizado] =
    useState(false);

  const [cargando, setCargando] =
    useState(true);

  useEffect(() => {
    async function verificarAcceso() {
      try {
        const usuario =
          await obtenerUsuarioActualRequest();

        if (!usuario) {
          if (!getAccessToken()) {
            router.replace("/login");
            return;
          }

          router.replace("/");
          return;
        }

        const tienePermisos =
          usuario.rol ===
            RolUsuario.usuarioModerador ||
          usuario.rol ===
            RolUsuario.usuarioAdministrador;

        if (!tienePermisos) {
          router.replace("/publicaciones");
          return;
        }

        setAutorizado(true);
      } catch {
        router.replace("/publicaciones");
      } finally {
        setCargando(false);
      }
    }

    void verificarAcceso();
  }, [router]);

  if (cargando) {
    return null;
  }

  if (!autorizado) {
    return null;
  }

  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <Navbar />
      </div>

      <main className={styles.body}>
        {children}
      </main>

      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  );
}