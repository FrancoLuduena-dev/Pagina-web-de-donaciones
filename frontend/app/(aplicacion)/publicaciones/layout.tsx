import Sidebar from "@/components/Sidebar";
import styles from "./publicaciones.module.css"

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
      <main className={styles.main}>{children}</main>
    </div>
  );
}