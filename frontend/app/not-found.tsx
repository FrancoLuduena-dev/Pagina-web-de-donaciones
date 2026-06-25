import Link from "next/link";

import styles from "./not-found.module.css";

/**
 * Página 404 global de la aplicación.
 *
 * Se muestra cuando se llama a `notFound()` o se accede a una ruta inexistente.
 * Ofrece un enlace para ir a las publicaciones.
 *
 * @returns Vista de "página no encontrada".
 */
export default function NotFound() {
  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <p className={styles.code}>404</p>
        <h1 className={styles.titulo}>Página no encontrada</h1>
        <p className={styles.descripcion}>
          La página que buscás no existe o ya no está disponible.
        </p>

        <div className={styles.acciones}>
          <Link href="/publicaciones" className={styles.botonVolver}>
            Ir a publicaciones
          </Link>
        </div>
      </div>
    </main>
  );
}
