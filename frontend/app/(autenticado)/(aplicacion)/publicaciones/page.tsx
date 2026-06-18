import Link from "next/link";
import PublicacionCard from "@/components/PublicacionCard";
import { mapPublicacionBackendToResumen } from "@/constants/publicacionesBackend";
import { listarPublicacionesDesdeBackend } from "@/lib/publicaciones";
import styles from "./publicaciones.module.css";

type Props = {
  searchParams: Promise<{
    condicion?: string;
    estado?: string;
  }>;
};

/**
 * Página principal de publicaciones.
 * @returns Listado general de publicaciones.
 */
export default async function PublicacionesPage({ searchParams }: Props) {
  let publicaciones: ReturnType<typeof mapPublicacionBackendToResumen>[] = [];
  let error = "";

  const { condicion, estado } = await searchParams;

  try {
    // TEST_DESCOMENTAR
    /*
const data = await listarPublicacionesDesdeBackend(
  undefined,
  condicion,
  estado,
);
*/
    // END_TEST_DESCOMENTAR
    const data = await listarPublicacionesDesdeBackend();
    publicaciones = data.map(mapPublicacionBackendToResumen);
  } catch {
    error =
      "No se pudieron cargar las publicaciones. ¿Está corriendo el backend?";
  }

  return (
    <section className={styles.contenido}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Publicaciones</h1>
        <Link href="/publicaciones/crear" className={styles.crearButton}>
          + Crear publicación
        </Link>
      </div>

      {error ? (
        <p className={styles.descripcion} style={{ color: "#dc2626" }}>
          {error}
        </p>
      ) : publicaciones.length === 0 ? (
        <p className={styles.descripcion}>
          Todavía no hay publicaciones. Creá la primera con el botón de arriba.
        </p>
      ) : (
        <p className={styles.descripcion}>
          {publicaciones.length} publicación
          {publicaciones.length === 1 ? "" : "es"} en la base.
        </p>
      )}

      {publicaciones.length > 0 ? (
        <div className={styles.grid}>
          {publicaciones.map((publicacion) => (
            <PublicacionCard
              key={publicacion.idPublicacion}
              publicacion={publicacion}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
