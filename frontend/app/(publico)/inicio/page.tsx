import Link from "next/link";
import styles from "./home.module.css";

/**
 * Página principal pública de la plataforma.
 * Muestra una introducción al sitio y accesos principales.
 * @returns Página de inicio.
 */
export default function HomePage() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Plataforma de donaciones
        </h1>

        <p className={styles.description}>
          Sumá tu granito de arena. Pronto vas a poder explorar campañas y donar desde acá.
        </p>

        <div className={styles.actions}>
          <Link
            href="/login"
            className={styles.primaryButton}
          >
            Iniciar sesión
          </Link>

          <Link
            href="/como_funciona"
            className={styles.primaryButton}
          >
            ¿Cómo funciona?
          </Link>
        </div>
      </div>
    </main>
  );
}