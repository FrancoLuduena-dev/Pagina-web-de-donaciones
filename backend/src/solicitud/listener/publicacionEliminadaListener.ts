import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventoDominio } from '../../compartidos/evento/eventoDominio';
import { PublicacionEliminadaEvento } from '../../publicacion/evento/publicacionEliminadaEvento';
import { SolicitudService } from '../service/solicitudService';

/**
 * Listener responsable de reaccionar ante la eliminación de una publicación.
 *
 * Procesa el evento de dominio de forma asincrónica y delega la resolución de
 * solicitudes asociadas al servicio de solicitudes, registrando los errores sin
 * interrumpir la propagación del evento.
 */
@Injectable()
export class PublicacionEliminadaListener {
  private readonly logger = new Logger(PublicacionEliminadaListener.name);

  constructor(private readonly solicitudService: SolicitudService) {}

  /**
   * Resuelve las solicitudes asociadas cuando una publicación es eliminada.
   *
   * El procesamiento se realiza de forma asincrónica por eventos y delega la
   * lógica de negocio al servicio correspondiente. Ante un error, se registra
   * en el log para no interrumpir el flujo del listener.
   */
  @OnEvent(EventoDominio.PUBLICACION_ELIMINADA, { async: true })
  async alEliminarPublicacion(
    evento: PublicacionEliminadaEvento,
  ): Promise<void> {
    try {
      await this.solicitudService.resolverSolicitudesPorPublicacionEliminada(
        evento.publicacionId,
        evento.publicacionTitulo,
        evento.eliminadaPorModeracion,
      );
    } catch (error: unknown) {
      const detalle = error instanceof Error ? error.message : String(error);

      this.logger.error(
        `No se pudieron resolver las solicitudes de la publicación ${evento.publicacionId}: ${detalle}`,
      );
    }
  }
}
