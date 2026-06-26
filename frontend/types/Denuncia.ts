/**
 * Representa una denuncia registrada en el sistema.
 */
export type Denuncia = {
  /** Identificador único de la denuncia. */
  id: string;
  /** Identificador de la publicación denunciada. */
  publicacionId: string;
  /** Identificador del usuario que realizó la denuncia. */
  denuncianteId: string;
  /** Identificador del creador de la publicación denunciada. */
  creadorPublicacionId: string;
  /** Identificador del moderador asignado, o `null` si no fue tomada. */
  moderadorAsignadoId?: string | null;
  /** Código del motivo de la denuncia. */
  motivo: string;
  /** Comentario opcional aportado por el denunciante. */
  comentario?: string | null;
  /** Estado de la denuncia (ej. `PENDIENTE`, `EN_REVISION`, `RESUELTA`). */
  estado: string;
  /** Tipo de resolución aplicada, o `null` si aún no se resolvió. */
  tipoResolucion?: string | null;
  /** Fecha de creación (ISO). */
  fechaCreacion: string;
  /** Fecha de última actualización (ISO). */
  fechaActualizacion: string;
  /** Versión para control de concurrencia optimista. */
  version: number;
};