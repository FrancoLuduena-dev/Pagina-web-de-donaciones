

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// Pagina raiz.
// Decide si enviar al usuario a la landing publica o a la aplicacion cuando exista autenticacion.
export default async function HomePage() {
  const cookieStore = await cookies();

  const token = cookieStore.get("token");

  // Sin auth -> landing publica
  if (!token) {
    redirect("/inicio");
  }

  // Validar auth
  const response = await fetch(
    "http://localhost:3000/usuario/me",
    {
      headers: {
        Authorization: `Bearer ${token.value}`,
      },
      cache: "no-store",
    }
  );

  // Token invalido o expirado
  if (!response.ok) {
    redirect("/inicio");
  }

  // Usuario autenticado
  redirect("/publicaciones");
}