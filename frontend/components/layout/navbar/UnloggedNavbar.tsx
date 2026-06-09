import Link from "next/link";
import { tituloPagina } from "@/constants/site";
import styles from "./UnloggedNavbar.module.css";

/**
 * Barra de navegación para usuarios no autenticados.
 *
 * Muestra el nombre o logo del sitio y accesos
 * a inicio de sesión y registro.
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
