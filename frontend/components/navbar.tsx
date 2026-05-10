import Link from "next/link";
import { tituloPagina } from "@/constants/site";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.seccionIzquierda}>
        <Link href="/" className={styles.logo}>
          {tituloPagina}
        </Link>

        <div className={styles.links}>
          <Link href="/">Inicio</Link>

          <Link href="/donaciones">
            Explorar Donaciones
          </Link>

          <Link href="/como_funciona">
            Cómo funciona
          </Link>
        </div>
      </div>

      <Link href="/usuario" className={styles.botonUsuario}>
        Usuario
      </Link>
    </nav>
  );
}