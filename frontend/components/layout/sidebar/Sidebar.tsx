"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import styles from "./Sidebar.module.css";

/**
 * Sidebar de navegación de categorías de publicaciones.
 * Resalta la categoría actual según la URL y permite desplegar el menú en dispositivos móviles.
 * @returns Menú lateral de categorías.
 */
export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const condicionSeleccionada = searchParams.get("condicion") ?? "";
  const estadoSeleccionado = searchParams.get("estado") ?? "";
  const categoriaActual = pathname.split("/")[2];
  const [menuOpen, setMenuOpen] = useState(false);

  function cambiarCondicion(condicion: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (condicion) {
      params.set("condicion", condicion);
    } else {
      params.delete("condicion");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function cambiarEstado(estado: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (estado) {
      params.set("estado", estado);
    } else {
      params.delete("estado");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <nav className={styles.sidebar}>
      <button className={styles.toggleButton} onClick={() => setMenuOpen(!menuOpen)}>
        ☰ Categorías
      </button>

      <h2 className={styles.title}>Categorías</h2>

      <ul className={menuOpen ? `${styles.nav} ${styles.navOpen}` : styles.nav}>
        <li className={styles.linkTodas}>
          <Link href="/publicaciones" className={styles.link} onClick={() => setMenuOpen(false)}>
            <span className={styles.icon}>
              {" "}
              <img src="/icons/packing-list.png" alt="" width={20} height={20} className={styles.iconoNormal} />
              <img src="/icons/packing-list_hover.png" alt="" width={20} height={20} className={styles.iconoHover} />
            </span>
            Todo
          </Link>
        </li>

        <li className={styles.linkIndumentaria}>
          <Link
            href="/publicaciones/indumentaria"
            onClick={() => setMenuOpen(false)}
            className={categoriaActual === "indumentaria" ? `${styles.link} ${styles.active}` : styles.link}
          >
            <span className={styles.icon}>
              {" "}
              <img src="/icons/t-shirt.png" alt="" width={20} height={20} className={styles.iconoNormal} />
              <img src="/icons/t-shirt_hover.png" alt="" width={20} height={20} className={styles.iconoHover} />
            </span>
            Indumentaria
          </Link>
        </li>

        <li className={styles.linkMuebles}>
          <Link
            href="/publicaciones/muebles"
            onClick={() => setMenuOpen(false)}
            className={categoriaActual === "muebles" ? `${styles.link} ${styles.active}` : styles.link}
          >
            <span className={styles.icon}>
              <img src="/icons/furniture.png" alt="" width={20} height={20} className={styles.iconoNormal} />

              <img src="/icons/furniture_hover.png" alt="" width={20} height={20} className={styles.iconoHover} />
            </span>
            Muebles
          </Link>
        </li>

        <li className={styles.linkAlimentos}>
          <Link
            href="/publicaciones/alimentos"
            onClick={() => setMenuOpen(false)}
            className={categoriaActual === "alimentos" ? `${styles.link} ${styles.active}` : styles.link}
          >
            <span className={styles.icon}>
              <img src="/icons/food.png" alt="" width={20} height={20} className={styles.iconoNormal} />

              <img src="/icons/food_hover.png" alt="" width={20} height={20} className={styles.iconoHover} />
            </span>
            Alimentos
          </Link>
        </li>

        <li className={styles.linkOtros}>
          <Link
            href="/publicaciones/otros"
            onClick={() => setMenuOpen(false)}
            className={categoriaActual === "otros" ? `${styles.link} ${styles.active}` : styles.link}
          >
            <span className={styles.icon}>
              <img src="/icons/box.png" alt="" width={20} height={20} className={styles.iconoNormal} />

              <img src="/icons/box_hover.png" alt="" width={20} height={20} className={styles.iconoHover} />
            </span>
            Otros
          </Link>
        </li>
      </ul>

      <div className={styles.filters}>
        <div className={styles.filaFiltro}>
          <label htmlFor="condicion" className={styles.labelFiltro}>
            Condición:
          </label>

          <select id="condicion" className={styles.selectFiltro} value={condicionSeleccionada} onChange={(e) => cambiarCondicion(e.target.value)}>
            <option value="">Todas</option>
            <option value="NUEVO">Nuevo</option>
            <option value="USADO_BUENO">Usado (buen estado)</option>
            <option value="USADO_REGULAR">Usado (estado regular)</option>
          </select>
        </div>
      </div>
    </nav>
  );
}
