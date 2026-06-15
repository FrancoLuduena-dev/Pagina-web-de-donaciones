import Link from "next/link";
import Gallery from "@/components/Gallery";
import { notFound } from "next/navigation";

import { publicacionesDestacadas } from "@/lib/mockPublicaciones";
import {
  labelCategoria,
  labelEstadoDonacion,
  labelEstadoPublicacion,
} from "@/lib/publicacionLabels";
import type { PublicacionResumen } from "@/types/PublicacionResumen";
import styles from "./page.module.css";

type Props = {
  params: {
    idPublicacion: string;
  };
};

export async function generateMetadata({ params }: Props) {
  const { idPublicacion } = await params;

  const publicacion = publicacionesDestacadas.find(
    (item) => item.idPublicacion === idPublicacion
  );

  return {
    title: publicacion ? publicacion.tituloPublicacion : `Publicación`,
  };
}

export default async function PublicacionDetailPage({ params }: Props) {
  const { idPublicacion } = await params;

  const publicacion = publicacionesDestacadas.find(
    (item) => item.idPublicacion === idPublicacion
  );

  if (!publicacion) {
    notFound();
  }

  const {
    tituloPublicacion,
    descripcionPublicacion,
    categoria,
    zonaRetiro,
    estadoPublicacion,
    estadoDonacion,
  } = publicacion as PublicacionResumen;

  const foto = (publicacion as PublicacionResumen & { urlFoto?: string }).urlFoto;
  const fotos =
    (publicacion as PublicacionResumen & { urlFotos?: string[] }).urlFotos ??
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
