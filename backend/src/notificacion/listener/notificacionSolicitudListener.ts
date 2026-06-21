import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { SolicitudCreadaEvent } from '../../solicitudes/evento/solicitudCreadaEvento';

import { NotificacionService } from '../service/notificacionService';
import { SolicitudRechazadaEvent } from 'src/solicitudes/evento/solicitudRechazadaEvento';
import { SolicitudAceptadaEvent } from 'src/solicitudes/evento/solicitudAceptadaEvento';
import { SolicitudAceptadaCanceladaEvento } from 'src/solicitudes/evento/solicitudAceptadaCanceladaEvento';
import { EventoDominio } from 'src/compartidos/evento/eventoDominio';
import { SolicitudFinalizadaEvento } from 'src/solicitudes/evento/solicitudFinalizadaEvento';
import { TipoNotificacion } from '../enum/tipoNotificacion';

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

  @OnEvent(EventoDominio.SOLICITUD_RECHAZADA, { async: true })
  async alRechazarSolicitud(evento: SolicitudRechazadaEvent): Promise<void> {
    try {
      const detalleMotivo = evento.motivo ? ` Motivo: ${evento.motivo}` : '';

      await this.notificacionService.crear({
        destinatarioId: evento.destinatarioId,
        tipo: TipoNotificacion.SOLICITUD_RECHAZADA,
        titulo: 'Solicitud rechazada',
        mensaje:
          `Tu solicitud para "${evento.publicacionTitulo}" fue rechazada.` +
          detalleMotivo,
        solicitudId: evento.solicitudId,
      });
    } catch (error: unknown) {
      const detalle = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `No se pudo crear la notificación de rechazo para la solicitud ${evento.solicitudId}: ${detalle}`,
      );
    }
  }

  @OnEvent(EventoDominio.SOLICITUD_ACEPTADA, { async: true })
  async alAceptarSolicitud(evento: SolicitudAceptadaEvent): Promise<void> {
    try {
      await this.notificacionService.crear({
        destinatarioId: evento.destinatarioId,
        tipo: TipoNotificacion.SOLICITUD_ACEPTADA,
        titulo: 'Solicitud aceptada',
        mensaje: `Tu solicitud para "${evento.publicacionTitulo}" fue aceptada.`,
        solicitudId: evento.solicitudId,
      });
    } catch (error: unknown) {
      const detalle = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `No se pudo crear la notificación de aceptación para la solicitud ${evento.solicitudId}: ${detalle}`,
      );
    }
  }

  @OnEvent(EventoDominio.SOLICITUD_ACEPTADA_CANCELADA, { async: true })
  async alCancelarSolicitudAceptada(
    evento: SolicitudAceptadaCanceladaEvento,
  ): Promise<void> {
    try {
      const detalleMotivo = evento.motivo ? ` Motivo: ${evento.motivo}` : '';

      await this.notificacionService.crear({
        destinatarioId: evento.destinatarioId,
        tipo: TipoNotificacion.SOLICITUD_ACEPTADA_CANCELADA,
        titulo: 'Solicitud aceptada cancelada',
        mensaje:
          `La aceptación de tu solicitud para "${evento.publicacionTitulo}" fue cancelada.` +
          detalleMotivo,
        solicitudId: evento.solicitudId,
      });
    } catch (error: unknown) {
      const detalle = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `No se pudo crear la notificación de cancelación para la solicitud ${evento.solicitudId}: ${detalle}`,
      );
    }
  }

  @OnEvent(EventoDominio.SOLICITUD_FINALIZADA, { async: true })
  async alFinalizarSolicitud(evento: SolicitudFinalizadaEvento): Promise<void> {
    try {
      await this.notificacionService.crear({
        destinatarioId: evento.destinatarioId,
        tipo: TipoNotificacion.SOLICITUD_FINALIZADA,
        titulo: 'Entrega finalizada',
        mensaje: `La entrega de "${evento.publicacionTitulo}" fue marcada como finalizada.`,
        solicitudId: evento.solicitudId,
      });
    } catch (error: unknown) {
      const detalle = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `No se pudo crear la notificación de finalización para la solicitud ${evento.solicitudId}: ${detalle}`,
      );
    }
  }
}
