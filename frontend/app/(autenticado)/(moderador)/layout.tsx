import styles from "./moderacion.module.css";
import Footer from "@/components/layout/footer/Footer";
import Navbar from "@/components/layout/navbar/Navbar";

/**
 * Layout principal de las páginas públicas de la aplicación.
 *
 * Incluye la barra de navegación y el footer global.
 *
 * @param children - Contenido renderizado dentro del layout.
 * @returns Estructura base de las páginas públicas.
 */
export default function PublicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <div className={styles.header}>
        <Navbar />
      </div>

      <main className={styles.body}>{children}</main>

      <div className={styles.footer}>
        <Footer />
      </div>
    </div>
  );
}
