"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();

  const categoriaActual =
    pathname.split("/")[2];

  return (
    <nav className={styles.sidebar}>
        <h2 className={styles.title}>
          Categorías
        </h2>

        <ul className={styles.nav}>
          <li>
            <Link
              href="/donaciones"
              className={styles.link}
            >
              <span className={styles.icon}>📋</span>
              Todas las categorías
            </Link>
          </li>

          <li>
            <Link
              href="/donaciones/indumentaria"
              className={
                categoriaActual === "indumentaria"
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              <span className={styles.icon}>👕</span>
              Indumentaria
            </Link>
          </li>

          <li>
            <Link
              href="/donaciones/muebles"
              className={
                categoriaActual === "muebles"
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              <span className={styles.icon}>🪑</span>
              Muebles
            </Link>
          </li>

          <li>
            <Link
              href="/donaciones/alimentos"
              className={
                categoriaActual === "alimentos"
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              <span className={styles.icon}>🍎</span>
              Alimentos
            </Link>
          </li>

          <li>
            <Link
              href="/donaciones/otros"
              className={
                categoriaActual === "otros"
                  ? `${styles.link} ${styles.active}`
                  : styles.link
              }
            >
              <span className={styles.icon}>📦</span>
              Otros
            </Link>
          </li>
        </ul>

    </nav>
  );
}