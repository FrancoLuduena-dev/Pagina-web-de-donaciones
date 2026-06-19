import Link from "next/link";

import PublicacionCard from "@/components/PublicacionCard";
import {
  CATEGORIA_IDS,
  mapPublicacionBackendToResumen,
} from "@/constants/publicacionesBackend";
import { listarPublicacionesDesdeBackend } from "@/lib/publicaciones";
import { CategoriaPublicacion } from "@/types/CategoriaPublicacion";

import styles from "./categoria.module.css";

type Props = {
  params: Promise<{
    categoria: string;
  }>;

  searchParams: Promise<{
    condicion?: string;
    estado?: string;
  }>;
};

const categoriasPorRuta: Record<string, CategoriaPublicacion> = {
  indumentaria: CategoriaPublicacion.INDUMENTARIA,
  muebles: CategoriaPublicacion.MUEBLES,
  alimentos: CategoriaPublicacion.ALIMENTOS,
  otros: CategoriaPublicacion.OTROS,
};

/**
 * Página de publicaciones filtradas por categoría.
 */
export default async function CategoriaPage({ params, searchParams }: Props) {
  const { categoria } = await params;

  const categoriaSeleccionada = categoriasPorRuta[categoria];
  const categoriaId = categoriaSeleccionada
    ? CATEGORIA_IDS[categoriaSeleccionada]
    : undefined;

  let publicaciones: ReturnType<typeof mapPublicacionBackendToResumen>[] = [];
  let error = "";
  const { condicion, estado } = await searchParams;

  try {
    // TEST_DESCOMENTAR
    /*
const data = await listarPublicacionesDesdeBackend(
  categoriaId,
  condicion,
  estado,
);
*/
    // END_TEST_DESCOMENTAR
    const data = await listarPublicacionesDesdeBackend(categoriaId);
    publicaciones = data.map(mapPublicacionBackendToResumen);
  } catch {
    error =
      "No se pudieron cargar las publicaciones. ¿Está corriendo el backend?";
  }

  return (
    <section className={styles.contenido}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>
          {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
        </h1>

        <Link href="/publicaciones/crear" className={styles.crearButton}>
          + Crear publicación
        </Link>
      </div>

      {error ? (
        <p className={styles.descripcion}>{error}</p>
      ) : publicaciones.length === 0 ? (
        <p className={styles.descripcion}>
          No hay publicaciones para esta categoría.
        </p>
      ) : (
        <>
          <p className={styles.descripcion}>
            {publicaciones.length} publicación
            {publicaciones.length === 1 ? "" : "es"} en esta categoría.
          </p>

          <div className={styles.grid}>
            {publicaciones.map((publicacion) => (
              <PublicacionCard
                key={publicacion.idPublicacion}
                publicacion={publicacion}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
