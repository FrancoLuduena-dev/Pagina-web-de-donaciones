import Link from "next/link";

import RemoteImage from "@/components/RemoteImage";

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
  /** Pasá `null` para ocultar el enlace (ej. publicaciones eliminadas). */
  href?: string | null;
};

/**
 * Tarjeta resumen de una publicación para los listados.
 *
 * Muestra imagen (o un placeholder con la inicial de la categoría), título,
 * descripción, categoría, zona de retiro y estado. Por defecto enlaza al
 * detalle de la publicación; si `href` es `null` se oculta el enlace.
 *
 * @param props Propiedades del componente.
 * @param props.publicacion Datos resumidos de la publicación a mostrar.
 * @param props.href Enlace personalizado, o `null` para ocultarlo.
 * @returns Tarjeta de publicación lista para renderizar en un listado.
 */
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

  const linkHref =
    href === null
      ? null
      : (href ?? `/publicaciones/publicacion/${idPublicacion}`);
  const disponible = estadoPublicacion === EstadoPublicacion.DISPONIBLE;

  return (
    <article className={styles.card}>
      <div className={styles.imageWrapper}>
        {urlFoto ? (
          <RemoteImage
            src={urlFoto}
            alt={tituloPublicacion}
            fill
            className={styles.image}
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

        {linkHref ? (
          <Link href={linkHref} className={styles.link}>
            Ver publicación
          </Link>
        ) : (
          <span className={styles.linkInactivo}>No disponible</span>
        )}
      </div>
    </article>
  );
}
