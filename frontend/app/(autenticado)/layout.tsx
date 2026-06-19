"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LayoutAutenticado({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  // null = verificando | true = autenticado
  const [estaAutenticado, setEstaAutenticado] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
    } else {
      setEstaAutenticado(true);
    }
  }, [router]);
  // Mientras verifica, evitamos el "flash" de contenido protegido
  if (estaAutenticado === null) {
    return <></>;
  }
  return <>{children}</>;
}
