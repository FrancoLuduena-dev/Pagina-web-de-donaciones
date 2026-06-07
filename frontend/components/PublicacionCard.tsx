import Image from "next/image";
import Link from "next/link";

import {
  labelCategoria,
  labelEstadoDonacion,
  labelEstadoPublicacion,
} from "@/lib/publicacionLabels";
import type { PublicacionResumen } from "@/types/PublicacionResumen";
import { EstadoPublicacion } from "@/types/EstadoPublicacion";
import styles from "./PublicacionCard.module.css";

type PublicacionCardProps = {
  publicacion: PublicacionResumen;
  href?: string;
};

export default function PublicacionCard({
  publicacion,
  href,
}: PublicacionCardProps) {
  const {
    idPublicacion,
    tituloPublicacion,
    descripcionPublicacion,
    urlFoto,
    categoria,
    zonaRetiro,
    estadoPublicacion,
    estadoDonacion,
  } = publicacion;

  const linkHref = href ?? `/donaciones/publicacion/${idPublicacion}`;
  const disponible = estadoPublicacion === EstadoPublicacion.DISPONIBLE;

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        {urlFoto ? (
          <Image
            src={urlFoto}
            alt={tituloPublicacion}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, 280px"
          />
        ) : (
          <div className={styles.imagePlaceholder} aria-hidden>
            <span>{labelCategoria(categoria).charAt(0)}</span>
          </div>
        )}
        <span
          className={`${styles.badge} ${disponible ? styles.badgeDisponible : styles.badgeOtro}`}
        >
          {labelEstadoPublicacion(estadoPublicacion)}
        </span>
      </div>

      <div className={styles.body}>
        <span className={styles.categoria}>{labelCategoria(categoria)}</span>
        <h3 className={styles.titulo}>{tituloPublicacion}</h3>
        <p className={styles.descripcion}>{descripcionPublicacion}</p>

        <div className={styles.meta}>
          <span className={styles.metaItem}>{zonaRetiro}</span>
          <span className={styles.metaItem}>
            {labelEstadoDonacion(estadoDonacion)}
          </span>
        </div>

        <Link href={linkHref} className={styles.link}>
          Ver publicación
        </Link>
      </div>
    </article>
  );
}
