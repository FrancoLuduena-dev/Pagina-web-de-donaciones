import { Denuncia } from "@/types/Denuncia";

import styles from "./DenunciaCard.module.css";


interface Props {
  denuncia: Denuncia;
  mostrarBotonTomar?: boolean;
  onTomar?: () => void;
}

const textosMotivo: Record<
  string,
  string
> = {
  CONTENIDO_INAPROPIADO:
    "Contenido inapropiado",
  PUBLICACION_FALSA:
    "Publicación falsa",
  OBJETO_PROHIBIDO:
    "Objeto prohibido",
  OTRO: "Otro",
};

const textosEstado: Record<
  string,
  string
> = {
  PENDIENTE: "Pendiente",
  EN_REVISION: "En revisión",
  RESUELTA: "Resuelta",
};

export default function DenunciaCard({
  denuncia, mostrarBotonTomar = false,
  onTomar,
}: Props) {
  const claseEstado =
    denuncia.estado === "PENDIENTE"
      ? styles.badgePendiente
      : denuncia.estado === "EN_REVISION"
        ? styles.badgeRevision
        : styles.badgeResuelta;

function formatearMotivo(
  motivo: string,
): string {
  return (
    textosMotivo[motivo] ??
    motivo
  );
}

function formatearEstado(
  estado: string,
): string {
  return (
    textosEstado[estado] ??
    estado
  );
}

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.titulo}>
          {formatearMotivo(denuncia.motivo,)}
        </h3>

        <span
          className={`${styles.badge} ${claseEstado}`}
        >
          {formatearEstado( denuncia.estado, )}
        </span>
      </div>

      {denuncia.comentario && (
        <p className={styles.comentario}>
          {denuncia.comentario}
        </p>
      )}

      <div className={styles.footer}>
        <span>
          Creada:
          {" "}
          {new Date(
            denuncia.fechaCreacion,
          ).toLocaleDateString()}
        </span>

        {denuncia.tipoResolucion && (
          <span>
            Resolución:
            {" "}
            {denuncia.tipoResolucion}
          </span>
        )}
      </div>
      {mostrarBotonTomar && onTomar && (
        <button
          type="button"
          className={styles.botonTomar}
          onClick={onTomar}
        >
          Tomar denuncia
        </button>
      )}
      
    </article>
  );
}