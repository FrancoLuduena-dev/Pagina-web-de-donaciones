"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { obtenerUsuarioActualRequest } from "@/lib/auth";

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
      try {
        const usuario = await obtenerUsuarioActualRequest();
        if (!usuario) {
          router.replace("/login");
          return;
        }
        setEstaAutenticado(true);
      } catch {
        router.replace("/login");
      }
    }

    void verificarSesion();
  }, [router]);
  // Mientras verifica, evitamos el "flash" de contenido protegido
  if (estaAutenticado === null) {
    return <></>;
  }
  return <>{children}</>;
}
