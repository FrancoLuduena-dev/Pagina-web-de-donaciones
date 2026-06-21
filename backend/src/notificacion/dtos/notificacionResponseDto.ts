import { TipoNotificacion } from '../enum/tipoNotificacion';
import { Notificacion } from '../entity/notificacionEntity';

export class NotificacionResponseDto {
  id!: string;
  tipo!: TipoNotificacion;
  titulo!: string;
  mensaje!: string;
  leida!: boolean;
  leidaEn!: Date | null;
  solicitudId!: string | null;
  publicacionId!: string | null;
  denunciaId!: string | null;
  creadaEn!: Date;

  static desdeEntidad(notificacion: Notificacion): NotificacionResponseDto {
    return {
      id: notificacion.id,
      tipo: notificacion.tipo,
      titulo: notificacion.titulo,
      mensaje: notificacion.mensaje,
      leida: notificacion.leidaEn !== null,
      leidaEn: notificacion.leidaEn,
      solicitudId: notificacion.solicitudId,
      publicacionId: notificacion.publicacionId,
      denunciaId: notificacion.denunciaId,
      creadaEn: notificacion.creadaEn,
    };
  }
}
