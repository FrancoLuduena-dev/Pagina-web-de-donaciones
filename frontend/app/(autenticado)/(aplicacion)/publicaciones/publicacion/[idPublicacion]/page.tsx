import Link from "next/link";
import Gallery from "@/components/Gallery";
import CancelarReservaButton from "@/components/publicaciones/CancelarReservaButton";
import CambiarEstadoPublicacionButton from "@/components/publicaciones/CambiarEstadoPublicacionButton";
import EliminarPublicacionButton from "@/components/publicaciones/EliminarPublicacionButton";
import MarcarEntregadaButton from "@/components/publicaciones/MarcarEntregadaButton";
import EditarPublicacionLink from "@/components/publicaciones/EditarPublicacionLink";
import DenunciarPublicacionButton from "@/components/publicaciones/DenunciarPublicacionButton";
import SolicitarPublicacionButton from "@/components/publicaciones/SolicitarPublicacionButton";
import {
  getImagenesPublicacion,
  labelCategoriaId,
  labelCondicion,
  labelEstadoPublicacionBackend,
  zonaRetiroDesdeLocalidadId,
} from "@/constants/publicacionesBackend";
import { obtenerPublicacionPorId } from "@/lib/publicaciones";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

type Props = {
  params: Promise<{
    idPublicacion: string;
  }>;
};

/**
 * Genera la metadata de la página de detalle (título de la pestaña).
 *
 * @param props Props de la página con los parámetros de ruta.
 * @param props.params Promesa con el `idPublicacion` de la ruta.
 * @returns Metadata con el título de la publicación o un valor por defecto.
 */
export async function generateMetadata({ params }: Props) {
  const { idPublicacion } = await params;
  const publicacion = await obtenerPublicacionPorId(idPublicacion);

  return {
    title: publicacion?.titulo ?? "Publicación",
  };
}

/**
 * Página de detalle de una publicación.
 *
 * Obtiene la publicación del backend y muestra su galería, datos y acciones
 * disponibles (solicitar, editar, cambiar estado, cancelar reserva, marcar
 * entregada, eliminar y denunciar). Si no existe en el backend, dispara
 * `notFound()`.
 *
 * @param props Props de la página con los parámetros de ruta.
 * @param props.params Promesa con el `idPublicacion` de la ruta.
 * @returns Vista de detalle de la publicación.
 */
export default async function PublicacionDetailPage({ params }: Props) {
  const { idPublicacion } = await params;
  const publicacionBackend = await obtenerPublicacionPorId(idPublicacion);

  if (publicacionBackend) {
    const fotos = getImagenesPublicacion(publicacionBackend);

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
                <p className={styles.detailValue}>
                  {zonaRetiroDesdeLocalidadId(publicacionBackend.localidadId)}
                </p>
              </article>
            </div>

            <div className={styles.detailRow}>
              <article className={styles.detailBlock}>
                <p className={styles.detailLabel}>Condición</p>
                <p className={styles.detailValue}>
                  {labelCondicion(publicacionBackend.condicion)}
                </p>
              </article>

              <article className={styles.detailBlock}>
                <p className={styles.detailLabel}>Publicado por</p>
                <p className={styles.detailValue}>
                  {publicacionBackend.creadorNombreCompleto ??
                    publicacionBackend.creadorNombreUsuario ??
                    "Usuario desconocido"}
                </p>
              </article>
            </div>
          </section>

          <div className={styles.actions}>
            <Link href="/publicaciones" className={styles.backLink}>
              ← Volver a publicaciones
            </Link>
            <SolicitarPublicacionButton
              idPublicacion={idPublicacion}
              creadorId={publicacionBackend.creadorId}
              estadoPublicacion={publicacionBackend.estado}
            />
            <EditarPublicacionLink
              idPublicacion={idPublicacion}
              creadorId={publicacionBackend.creadorId}
              estadoPublicacion={publicacionBackend.estado}
              className={styles.backLink}
            />
            <CambiarEstadoPublicacionButton
              idPublicacion={idPublicacion}
              creadorId={publicacionBackend.creadorId}
              estadoPublicacion={publicacionBackend.estado}
            />
            <CancelarReservaButton
              idPublicacion={idPublicacion}
              creadorId={publicacionBackend.creadorId}
              estadoPublicacion={publicacionBackend.estado}
            />
            <MarcarEntregadaButton
              idPublicacion={idPublicacion}
              creadorId={publicacionBackend.creadorId}
              estadoPublicacion={publicacionBackend.estado}
            />
            <EliminarPublicacionButton
              idPublicacion={idPublicacion}
              creadorId={publicacionBackend.creadorId}
              estadoPublicacion={publicacionBackend.estado}
            />
            <DenunciarPublicacionButton
              idPublicacion={idPublicacion}
              creadorId={publicacionBackend.creadorId}
            />
          </div>
        </div>
      </main>
    );
  }

  notFound();
}
