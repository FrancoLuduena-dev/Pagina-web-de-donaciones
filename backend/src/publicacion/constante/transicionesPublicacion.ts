import { EstadoPublicacion } from '../enums/estadoPublicacion';

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
