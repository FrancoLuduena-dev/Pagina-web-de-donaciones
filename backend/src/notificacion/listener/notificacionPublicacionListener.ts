import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventoDominio } from '../../compartidos/evento/eventoDominio';
import { PublicacionModeradaEvento } from '../../publicacion/evento/publicacionModeradaEvento';
import { TipoNotificacion } from '../enum/tipoNotificacion';
import { NotificacionService } from '../service/notificacionService';

/**
 * Listener que reacciona a eventos de publicaciones para generar notificaciones.
 *
 * Procesa los eventos de forma asincrónica y delega la creación de avisos al
 * servicio de notificaciones.
 */
@Injectable()
export class NotificacionPublicacionListener {
  private readonly logger = new Logger(NotificacionPublicacionListener.name);

  constructor(private readonly notificacionService: NotificacionService) {}

  /**
   * Genera una notificación cuando una publicación es pausada por moderación.
   */
  @OnEvent(EventoDominio.PUBLICACION_PAUSADA_MODERACION, { async: true })
  async alPausarPublicacion(evento: PublicacionModeradaEvento): Promise<void> {
    await this.crearNotificacion(
      evento,
      TipoNotificacion.PUBLICACION_PAUSADA,
      'Publicación pausada',
      `Tu publicación "${evento.publicacionTitulo}" fue pausada por moderación.`,
    );
  }

  /**
   * Genera una notificación cuando una publicación es reactivada por moderación.
   */
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

  /**
   * Genera una notificación cuando una publicación es eliminada por moderación.
   */
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

  /**
   * Crea una notificación asociada a una publicación moderada.
   *
   * Si ocurre un error durante la creación, se registra en logs y no se propaga
   * para evitar interrumpir el procesamiento asincrónico del evento.
   *
   * @param evento Datos del evento de moderación de publicación.
   * @param tipo Tipo de notificación a generar.
   * @param titulo Título visible de la notificación.
   * @param mensaje Mensaje informado al destinatario.
   */
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
