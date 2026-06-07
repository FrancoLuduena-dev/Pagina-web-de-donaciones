import styles from "./aplicacion.module.css"
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

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
      <Navbar />

      {children}

      <Footer />
    </div>
  );
}