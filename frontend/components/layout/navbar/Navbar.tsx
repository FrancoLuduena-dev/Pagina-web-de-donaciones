import Link from "next/link";
import { tituloPagina } from "@/constants/site";
import styles from "./Navbar.module.css";
import MenuUsuario from "@/components/layout/navbar/botonUsuario/MenuUsuario";

/** Navbar principal para usuarios logueados. */

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <p>{tituloPagina}</p>
      </div>

      <div className={styles.links}>
        <Link href="/publicaciones">Inicio</Link>
        <Link href="/publicaciones">Explorar publicaciones</Link>
        <Link href="/ayuda">Preguntas Frecuentes</Link>
      </div>

      <div className={styles.botonUsuario}>
        <MenuUsuario />
      </div>
    </nav>
  );
}
