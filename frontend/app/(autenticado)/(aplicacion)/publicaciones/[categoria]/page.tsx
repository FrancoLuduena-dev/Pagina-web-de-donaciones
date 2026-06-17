import styles from "./categoria.module.css"

type Props = {
  params: Promise<{
    categoria: string;
  }>;
};

/**
 * Página dinámica de categorías de donaciones.
 *
 * Muestra el nombre de la categoría obtenida desde la URL.
 *
 * @param params - Parámetros dinámicos de la ruta.
 * @returns Página de categoría.
 */
export default async function CategoriaPage({
  params,
}: Props) {
  const { categoria } = await params;

  return (
    <main>
      <h1 className={styles.titulo}>
        {" "}
        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
      </h1>
    </main>
  );
}