import Link from "next/link";
import { tituloPagina } from "@/constants/site";
import styles from "./Navbar.module.css";
import MenuUsuario from "@/components/layout/navbar/botonUsuario/MenuUsuario";

/** Navbar principal para usuarios logueados. */

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">{tituloPagina}</Link>
      </div>

      <div className={styles.links}>
        <Link href="/publicaciones">Inicio</Link>
        <Link href="/publicaciones">Explorar publicaciones</Link>
        <Link href="/como_funciona">Cómo funciona</Link>
      </div>

      <div className={styles.botonUsuario}>
        <MenuUsuario />
      </div>
    </nav>
  );
}
