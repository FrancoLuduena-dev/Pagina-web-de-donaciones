import UnloggedNavbar from "@/components/UnloggedNavbar";
import styles from "./autenticacion.module.css";

/**
 * Layout de las páginas de autenticación.
 *
 * Incluye la barra de navegación para usuarios no autenticados.
 *
 * @param children - Contenido renderizado dentro del layout.
 * @returns Estructura base de autenticación.
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

    </div>
  );
}