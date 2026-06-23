import Link from "next/link";
import styles from "./Footer.module.css";
import { email } from "@/constants/site";

/** Footer de la aplicación. */

export default function Footer() {
  return (
    <footer className={styles.footer}>


      <p className={styles.copyright}>
        © 2026 Todos los derechos reservados.
      </p>

      <div className={styles.links}>
        <a href={`mailto:${email}`} className={styles.links}>
          Contactanos
        </a>
      </div>
    </footer>
  );
}


