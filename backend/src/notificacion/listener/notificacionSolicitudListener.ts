import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { SolicitudCreadaEvent } from '../../solicitudes/evento/solicitudCreadaEvent';
import { TipoNotificacion } from '../enum/tipoNotificacion';
import { NotificacionService } from '../service/notificacionService';
import { EventoDominio } from 'src/compartidos/evento/eventoDominio';

@Injectable()
export class NotificacionSolicitudListener {
  private readonly logger = new Logger(NotificacionSolicitudListener.name);

  constructor(private readonly notificacionService: NotificacionService) {}

  @OnEvent(EventoDominio.SOLICITUD_CREADA, { async: true })
  async alCrearSolicitud(evento: SolicitudCreadaEvent): Promise<void> {
    try {
      await this.notificacionService.crear({
        destinatarioId: evento.destinatarioId,
        tipo: TipoNotificacion.SOLICITUD_CREADA,
        titulo: 'Nueva solicitud',
        mensaje: `Recibiste una nueva solicitud para "${evento.publicacionTitulo}".`,
        solicitudId: evento.solicitudId,
      });
    } catch (error: unknown) {
      const detalle = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `No se pudo crear la notificación para la solicitud ${evento.solicitudId}: ${detalle}`,
      );
    }
  }
}
