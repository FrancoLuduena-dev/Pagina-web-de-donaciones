import Link from "next/link";
import { tituloPagina } from "@/constants/site";
import styles from "./UnloggedNavbar.module.css";

/**
 * Navbar para visitantes no autenticados.
 *
 * Contiene:
 * - Nombre/logo del sitio
 * - Link a log in
 * - Link a registro
 */

export default function UnloggedNavbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        {tituloPagina}
      </Link>

      <div className={styles.links}>
        <Link href="/login" className={styles.link}>
          Iniciar Sesión
        </Link>

        <Link href="/register" className={styles.botonRegistro}>
          Registrarse
        </Link>
      </div>
    </nav>
  );
}
