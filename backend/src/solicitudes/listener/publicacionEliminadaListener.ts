import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventoDominio } from '../../compartidos/evento/eventoDominio';
import { PublicacionEliminadaEvento } from '../../publicacion/evento/publicacionEliminadaEvento';
import { SolicitudService } from '../service/solicitudService';

@Injectable()
export class PublicacionEliminadaListener {
  private readonly logger = new Logger(PublicacionEliminadaListener.name);

  constructor(private readonly solicitudService: SolicitudService) {}

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
