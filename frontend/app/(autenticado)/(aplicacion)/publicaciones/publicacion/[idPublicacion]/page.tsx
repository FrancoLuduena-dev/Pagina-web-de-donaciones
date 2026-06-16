import Link from "next/link";
import Gallery from "@/components/Gallery";
import {
  labelCategoriaId,
  labelCondicion,
  labelEstadoPublicacionBackend,
} from "@/constants/publicacionesBackend";
import { obtenerPublicacionPorId } from "@/lib/publicaciones";
import { publicacionesDestacadas } from "@/lib/mockPublicaciones";
import {
  labelCategoria,
  labelEstadoDonacion,
  labelEstadoPublicacion,
} from "@/lib/publicacionLabels";
import type { PublicacionResumen } from "@/types/PublicacionResumen";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

type Props = {
  params: Promise<{
    idPublicacion: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { idPublicacion } = await params;
  const publicacion = await obtenerPublicacionPorId(idPublicacion);

  return {
    title: publicacion?.titulo ?? "Publicación",
  };
}

export default async function PublicacionDetailPage({ params }: Props) {
  const { idPublicacion } = await params;
  const publicacionBackend = await obtenerPublicacionPorId(idPublicacion);

  if (publicacionBackend) {
    const fotos = publicacionBackend.imagenUrl ? [publicacionBackend.imagenUrl] : [];

    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.header}>
            <div className={styles.imageWrapper}>
              {fotos.length ? (
                <Gallery images={fotos} />
              ) : (
                <div className={styles.imagePlaceholder} aria-hidden>
                  <span>{labelCategoriaId(publicacionBackend.categoriaId).charAt(0)}</span>
                </div>
              )}
            </div>

            <div>
              <p className={styles.detailLabel}>Detalle de publicación</p>
              <h1 className={styles.title}>{publicacionBackend.titulo}</h1>
              <p className={styles.description}>{publicacionBackend.descripcion}</p>
            </div>

            <span className={styles.statusBadge}>
              {labelEstadoPublicacionBackend(publicacionBackend.estado)}
            </span>
          </section>

          <section className={styles.details}>
            <div className={styles.detailRow}>
              <article className={styles.detailBlock}>
                <p className={styles.detailLabel}>Categoría</p>
                <p className={styles.detailValue}>
                  {labelCategoriaId(publicacionBackend.categoriaId)}
                </p>
              </article>

              <article className={styles.detailBlock}>
                <p className={styles.detailLabel}>Localidad</p>
                <p className={styles.detailValue}>{publicacionBackend.localidadId}</p>
              </article>
            </div>

            <div className={styles.detailRow}>
              <article className={styles.detailBlock}>
                <p className={styles.detailLabel}>Condición</p>
                <p className={styles.detailValue}>
                  {labelCondicion(publicacionBackend.condicion)}
                </p>
              </article>
            </div>
          </section>

          <div className={styles.actions}>
            <Link href="/publicaciones" className={styles.backLink}>
              ← Volver a publicaciones
            </Link>
            <Link
              href={`/publicaciones/publicacion/${idPublicacion}/editar`}
              className={styles.backLink}
              style={{ marginLeft: "0.75rem" }}
            >
              Editar publicación
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const publicacionMock = publicacionesDestacadas.find(
    (item) => item.idPublicacion === idPublicacion,
  );

  if (!publicacionMock) {
    notFound();
  }

  const {
    tituloPublicacion,
    descripcionPublicacion,
    categoria,
    zonaRetiro,
    estadoPublicacion,
    estadoDonacion,
  } = publicacionMock as PublicacionResumen;

  const foto = (publicacionMock as PublicacionResumen & { urlFoto?: string }).urlFoto;
  const fotos =
    (publicacionMock as PublicacionResumen & { urlFotos?: string[] }).urlFotos ??
    (foto ? [foto] : []);

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <section className={styles.header}>
          <div className={styles.imageWrapper}>
            {fotos.length ? (
              <Gallery images={fotos} />
            ) : (
              <div className={styles.imagePlaceholder} aria-hidden>
                <span>{labelCategoria(categoria).charAt(0)}</span>
              </div>
            )}
          </div>

          <div>
            <p className={styles.detailLabel}>Detalle de publicación</p>
            <h1 className={styles.title}>{tituloPublicacion}</h1>
            <p className={styles.description}>{descripcionPublicacion}</p>
          </div>

          <span className={styles.statusBadge}>
            {labelEstadoPublicacion(estadoPublicacion)}
          </span>
        </section>

        <section className={styles.details}>
          <div className={styles.detailRow}>
            <article className={styles.detailBlock}>
              <p className={styles.detailLabel}>Categoría</p>
              <p className={styles.detailValue}>{labelCategoria(categoria)}</p>
            </article>

            <article className={styles.detailBlock}>
              <p className={styles.detailLabel}>Zona de retiro</p>
              <p className={styles.detailValue}>{zonaRetiro}</p>
            </article>
          </div>

          <div className={styles.detailRow}>
            <article className={styles.detailBlock}>
              <p className={styles.detailLabel}>Estado de donación</p>
              <p className={styles.detailValue}>
                {labelEstadoDonacion(estadoDonacion)}
              </p>
            </article>
          </div>
        </section>

        <div className={styles.actions}>
          <Link href="/publicaciones" className={styles.backLink}>
            ← Volver a publicaciones
          </Link>
          <Link
            href={`/publicaciones/publicacion/${idPublicacion}/editar`}
            className={styles.backLink}
            style={{ marginLeft: "0.75rem" }}
          >
            Editar publicación
          </Link>
        </div>
      </div>
    </main>
  );
}
