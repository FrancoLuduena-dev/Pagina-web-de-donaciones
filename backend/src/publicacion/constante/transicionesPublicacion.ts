import { EstadoPublicacion } from '../enums/estadoPublicacion';

/**
 * Definición de las transiciones de estado permitidas para una publicación.
 *
 * Cada estado representa una etapa del ciclo de vida y solo permite avanzar o
 * retroceder según la lógica del negocio.
 */
export const TRANSICIONES_PUBLICACION: Record<
  EstadoPublicacion,
  EstadoPublicacion[]
> = {
  [EstadoPublicacion.DISPONIBLE]: [
    EstadoPublicacion.RESERVADA,
    EstadoPublicacion.PAUSADA,
    EstadoPublicacion.ELIMINADA,
  ],

  [EstadoPublicacion.RESERVADA]: [
    EstadoPublicacion.ENTREGADA,
    EstadoPublicacion.DISPONIBLE,
  ],

  [EstadoPublicacion.PAUSADA]: [
    EstadoPublicacion.DISPONIBLE,
    EstadoPublicacion.ELIMINADA,
  ],

  [EstadoPublicacion.ENTREGADA]: [],

  [EstadoPublicacion.ELIMINADA]: [],
};
