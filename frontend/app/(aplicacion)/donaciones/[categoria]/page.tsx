// app/donaciones/[categoria]/page.tsx

type Props = {
  params: Promise<{
    categoria: string;
  }>;
};

export default async function CategoriaPage({
  params,
}: Props) {
  const { categoria } = await params;

  return (
    <main>
      <h1>
        Categoría seleccionada:{" "}
        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
      </h1>
    </main>
  );
}