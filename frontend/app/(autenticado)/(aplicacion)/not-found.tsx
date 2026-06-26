import Link from "next/link";

import styles from "../../not-found.module.css";

/**
 * Página 404 de la sección autenticada de la aplicación.
 *
 * Se renderiza dentro del layout con navbar y footer cuando se llama a
 * `notFound()` en alguna página de esta sección (por ejemplo, el detalle de una
 * publicación inexistente). Ofrece un enlace para ir a las publicaciones.
 *
 * @returns Vista de "página no encontrada" dentro de la app.
 */
export default function NotFoundAplicacion() {
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
