import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventoDominio } from '../../compartidos/evento/eventoDominio';
import { PublicacionModeradaEvento } from '../../publicacion/evento/publicacionModeradaEvento';
import { TipoNotificacion } from '../enum/tipoNotificacion';
import { NotificacionService } from '../service/notificacionService';

@Injectable()
export class NotificacionPublicacionListener {
  private readonly logger = new Logger(NotificacionPublicacionListener.name);

  constructor(private readonly notificacionService: NotificacionService) {}

  @OnEvent(EventoDominio.PUBLICACION_PAUSADA_MODERACION, { async: true })
  async alPausarPublicacion(evento: PublicacionModeradaEvento): Promise<void> {
    await this.crearNotificacion(
      evento,
      TipoNotificacion.PUBLICACION_PAUSADA,
      'Publicación pausada',
      `Tu publicación "${evento.publicacionTitulo}" fue pausada por moderación.`,
    );
  }

  @OnEvent(EventoDominio.PUBLICACION_REACTIVADA_MODERACION, { async: true })
  async alReactivarPublicacion(
    evento: PublicacionModeradaEvento,
  ): Promise<void> {
    await this.crearNotificacion(
      evento,
      TipoNotificacion.PUBLICACION_REACTIVADA,
      'Publicación reactivada',
      `Tu publicación "${evento.publicacionTitulo}" fue reactivada por moderación.`,
    );
  }

  @OnEvent(EventoDominio.PUBLICACION_ELIMINADA_MODERACION, { async: true })
  async alEliminarPublicacion(
    evento: PublicacionModeradaEvento,
  ): Promise<void> {
    await this.crearNotificacion(
      evento,
      TipoNotificacion.PUBLICACION_ELIMINADA,
      'Publicación eliminada',
      `Tu publicación "${evento.publicacionTitulo}" fue eliminada por moderación.`,
    );
  }

  private async crearNotificacion(
    evento: PublicacionModeradaEvento,
    tipo: TipoNotificacion,
    titulo: string,
    mensaje: string,
  ): Promise<void> {
    try {
      await this.notificacionService.crear({
        destinatarioId: evento.destinatarioId,
        tipo,
        titulo,
        mensaje,
        publicacionId: evento.publicacionId,
      });
    } catch (error: unknown) {
      const detalle = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `No se pudo crear la notificación para la publicación ${evento.publicacionId}: ${detalle}`,
      );
    }
  }
}
