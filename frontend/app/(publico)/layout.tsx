import Footer from "@/components/layout/footer/Footer";
import UnloggedNavbar from "@/components/layout/navbar/UnloggedNavbar";
import styles from "./publico.module.css";

/**
 * Layout principal de las páginas públicas.
 *
 * Incluye la barra de navegación y el footer global.
 *
 * @param children - Contenido renderizado dentro del layout.
 * @returns Estructura base de páginas públicas.
 */
export default function PublicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.layout}>
      <UnloggedNavbar />

      {children}

      <Footer />
    </div>
  );
}