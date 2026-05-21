import Link from "next/link";
import { tituloPagina } from "@/constants/site";
import styles from "./Navbar.module.css";

/** Navbar principal para usuarios logueados. */

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">{tituloPagina}</Link>
      </div>


      <div className={styles.links}>
        <Link href="/">Inicio</Link>
        <Link href="/donaciones">Explorar donaciones</Link>
        <Link href="/como_funciona">Cómo funciona</Link>
      </div>

      <div className={styles.botonUsuario}>
        <Link href="/usuario">Usuario</Link>
      </div>

      
    </nav>
  );
}
