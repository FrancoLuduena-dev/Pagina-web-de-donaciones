import Link from "next/link";
import { tituloPagina } from "@/constants/site";
import styles from "./Footer.module.css";

/**
 * Footer de la aplicación.
 *
 * Contiene:
 * - Nombre del sitio
 * - Copyright
 * - Link Contacto y Sobre Nosotros
 */

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.seccionIzquierda}>
        <p className={styles.nombreSitio}>
          {tituloPagina}
        </p>

        <p className={styles.copyright}>
          © 2026 Todos los derechos reservados.
        </p>
      </div>

      <div className={styles.links}>
        <Link href="/about">
          Sobre Nosotros
        </Link>

        <Link href="/contact">
          Contactanos
        </Link>
      </div>
    </footer>
  );
}