import { EstadoSolicitud } from '../enums/estadoSolicitud';

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
