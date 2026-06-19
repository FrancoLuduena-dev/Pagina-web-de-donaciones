  import Sidebar from "@/components/layout/sidebar/Sidebar";
  import styles from "./publicaciones.module.css"
  import Searchbar from "@/components/publicaciones/searchbar/Searchbar";
  import { Suspense } from "react";

  /**
   * Layout de la sección de donaciones.
   *
   * Incluye la barra lateral de categorías.
   *
   * @param children - Contenido renderizado dentro del layout.
   * @returns Estructura base de la sección de donaciones.
   */
  export default function PublicoLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {
    return (
      <div className={styles.layout}>
        <Sidebar />
        <main className={styles.main}>
          <Searchbar />
          {children}
        </main>
      </div>
    );
  }