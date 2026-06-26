import { redirect } from "next/navigation";

/**
 * Redirección de la ruta antigua de mis publicaciones.
 *
 * Mantiene compatibilidad enviando a `/usuario/publicaciones`, donde vive ahora
 * el historial de publicaciones del usuario.
 *
 * @returns Nunca retorna; ejecuta una redirección de Next.js.
 */
export default function MisPublicacionesRedirectPage() {
  redirect("/usuario/publicaciones");
}
