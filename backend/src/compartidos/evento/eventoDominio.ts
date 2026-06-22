export enum EventoDominio {
  SOLICITUD_CREADA = 'solicitud.creada',
  SOLICITUD_ACEPTADA = 'solicitud.aceptada',
  SOLICITUD_RECHAZADA = 'solicitud.rechazada',
  SOLICITUD_ACEPTADA_CANCELADA = 'solicitud.aceptada.cancelada',
  SOLICITUD_FINALIZADA = 'solicitud.finalizada',
  PUBLICACION_PAUSADA_MODERACION = 'publicacion.pausada.moderacion',
  PUBLICACION_REACTIVADA_MODERACION = 'publicacion.reactivada.moderacion',
  PUBLICACION_ELIMINADA = 'publicacion.eliminada',
  PUBLICACION_ELIMINADA_MODERACION = 'publicacion.eliminada.moderacion',
  DENUNCIA_RESUELTA = 'denuncia.resuelta',
}
