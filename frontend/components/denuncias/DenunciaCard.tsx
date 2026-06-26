import { Denuncia } from "@/types/Denuncia";

import styles from "./DenunciaCard.module.css";

interface Props {
  /** Denuncia a mostrar en la tarjeta. */
  denuncia: Denuncia;
  /** Muestra el botón para tomar la denuncia si es verdadero. */
  mostrarBotonTomar?: boolean;
  /** Callback al tomar la denuncia. */
  onTomar?: () => void;
  /** Callback al resolver la denuncia. */
  onResolver?: () => void;
  /** Muestra el botón para resolver la denuncia si es verdadero. */
  mostrarBotonResolver?: boolean;
}

const textosMotivo: Record<string, string> = {
  CONTENIDO_INAPROPIADO: "Contenido inapropiado",
  PUBLICACION_FALSA: "Publicación falsa",
  OBJETO_PROHIBIDO: "Objeto prohibido",
  OTRO: "Otro",
};

const textosEstado: Record<string, string> = {
  PENDIENTE: "Pendiente",
  EN_REVISION: "En revisión",
  RESUELTA: "Resuelta",
};

/**
 * Componente que renderiza una tarjeta de denuncia.
 * @param props Propiedades del componente.
 * @returns Carta de denuncia con estado y acciones.
 */
export default function DenunciaCard({ denuncia, mostrarBotonTomar, onTomar, mostrarBotonResolver, onResolver }: Props) {
  const claseEstado = denuncia.estado === "PENDIENTE" ? styles.badgePendiente : denuncia.estado === "EN_REVISION" ? styles.badgeRevision : styles.badgeResuelta;

  function formatearMotivo(motivo: string): string {
    return textosMotivo[motivo] ?? motivo;
  }

  function formatearEstado(estado: string): string {
    return textosEstado[estado] ?? estado;
  }

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.titulo}>{formatearMotivo(denuncia.motivo)}</h3>

        <span className={`${styles.badge} ${claseEstado}`}>{formatearEstado(denuncia.estado)}</span>
      </div>

      {denuncia.comentario && <p className={styles.comentario}>{denuncia.comentario ?? "Sin comentario adicional."}</p>}
      <a href={`/publicaciones/publicacion/${denuncia.publicacionId}`} target="_blank" rel="noreferrer" className={styles.linkPublicacion}>
        Ver publicación denunciada
      </a>

      <div className={styles.footer}>
        <span>Creada: {new Date(denuncia.fechaCreacion).toLocaleDateString()}</span>

        {denuncia.tipoResolucion && <span>Resolución: {denuncia.tipoResolucion}</span>}
      </div>
      {mostrarBotonTomar && onTomar && (
        <button type="button" className={styles.botonTomar} onClick={onTomar}>
          Tomar denuncia
        </button>
      )}
      {mostrarBotonResolver && (
        <button type="button" className={styles.botonResolver} onClick={onResolver}>
          Resolver denuncia
        </button>
      )}
    </article>
  );
}
