import Link from "next/link";
import styles from "./publicaciones.module.css";

/**
 * Página principal de publicaciones.
 *
 * @returns Listado general de publicaciones.
 */
export default function PublicacionesPage() {
  return (
    <section className={styles.contenido}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
        <h1 className={styles.titulo}>Publicaciones</h1>
        <Link
          href="/publicaciones/crear"
          style={{ padding: "0.6rem 1rem", borderRadius: "999px", background: "#1f6feb", color: "white", textDecoration: "none" }}
        >
          + Crear publicación
        </Link>
      </div>
      <p>Desde aquí empezamos el flujo de creación y edición de publicaciones.</p>
    </section>
  );
}