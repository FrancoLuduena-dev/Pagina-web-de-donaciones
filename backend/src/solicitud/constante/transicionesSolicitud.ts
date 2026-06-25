import { EstadoSolicitud } from '../enums/estadoSolicitud';

/**
 * Define las transiciones de estado permitidas para una solicitud.
 *
 * Esta máquina de estados evita cambios de estado inconsistentes y refleja el
 * flujo del negocio: una solicitud pendiente puede avanzar a aceptada,
 * rechazada o cancelada; una aceptada puede finalizarse, expirar o cancelarse.
 */
export const TRANSICIONES_SOLICITUD: Record<
  EstadoSolicitud,
  EstadoSolicitud[]
> = {
  [EstadoSolicitud.PENDIENTE]: [
    EstadoSolicitud.ACEPTADA,
    EstadoSolicitud.RECHAZADA,
    EstadoSolicitud.CANCELADA,
  ],

  [EstadoSolicitud.ACEPTADA]: [
    EstadoSolicitud.FINALIZADA,
    EstadoSolicitud.EXPIRADA,
    EstadoSolicitud.CANCELADA,
  ],

  [EstadoSolicitud.RECHAZADA]: [],
  [EstadoSolicitud.CANCELADA]: [],
  [EstadoSolicitud.FINALIZADA]: [],
  [EstadoSolicitud.EXPIRADA]: [],
};
