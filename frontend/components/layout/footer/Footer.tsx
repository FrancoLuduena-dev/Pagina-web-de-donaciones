import Link from "next/link";
import styles from "./Footer.module.css";

/** Footer de la aplicación. */

export default function Footer() {
  return (
    <footer className={styles.footer}>


      <p className={styles.copyright}>
        © 2026 Todos los derechos reservados.
      </p>

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


