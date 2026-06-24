"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken, obtenerUsuarioActualRequest } from "@/lib/auth";

export default function LayoutAutenticado({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  // null = verificando | true = autenticado
  const [estaAutenticado, setEstaAutenticado] = useState<boolean | null>(null);

  useEffect(() => {
    async function verificarSesion() {
      const usuario = await obtenerUsuarioActualRequest();
      if (usuario) {
        setEstaAutenticado(true);
        return;
      }

      if (!getAccessToken()) {
        router.replace("/login");
        return;
      }

      // Token presente pero el backend no respondió: no expulsar al usuario.
      setEstaAutenticado(true);
    }

    void verificarSesion();
  }, [router]);
  // Mientras verifica, evitamos el "flash" de contenido protegido
  if (estaAutenticado === null) {
    return <></>;
  }
  return <>{children}</>;
}
