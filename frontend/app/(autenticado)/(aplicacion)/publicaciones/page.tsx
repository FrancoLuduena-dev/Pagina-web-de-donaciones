import Link from "next/link";
import PublicacionCard from "@/components/PublicacionCard";
import { publicacionesDestacadas } from "@/lib/mockPublicaciones";
import styles from "./publicaciones.module.css";

/**
 * Página principal de publicaciones.
 *
 * @returns Listado general de publicaciones.
 */
export default function PublicacionesPage() {
  return (
    <section className={styles.contenido}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Publicaciones</h1>
        <Link href="/publicaciones/crear" className={styles.crearButton}>
          + Crear publicación
        </Link>
      </div>
      <p className={styles.descripcion}>
        Desde aquí empezamos el flujo de creación y edición de publicaciones.
      </p>

      <div className={styles.grid}>
        {publicacionesDestacadas.map((p) => (
          <PublicacionCard key={p.idPublicacion} publicacion={p} />
        ))}
      </div>
    </section>
  );
}
