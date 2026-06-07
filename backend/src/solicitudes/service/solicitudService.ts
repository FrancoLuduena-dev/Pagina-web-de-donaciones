import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Solicitud } from '../entity/solicitudEntity';
import { SolicitudRepository } from '../repository/solicitudRepository';
import { PublicacionService } from '../../publicacion/service/publicacionService';
import { EstadoPublicacion } from '../../publicacion/enums/estadoPublicacion';
import { CrearSolicitudDto } from '../DTO/crearSolicitudDto';

@Injectable()
export class SolicitudService {
  constructor(
    private readonly solicitudRepository: SolicitudRepository,
    private readonly publicacionService: PublicacionService,
  ) {}

  async crearSolicitud(
    dto: CrearSolicitudDto,
    solicitanteId: string,
  ): Promise<Solicitud> {
    const publicacion = await this.publicacionService.buscarPublicacionPorId(
      dto.publicacionId,
    );

    if (publicacion.estado !== EstadoPublicacion.DISPONIBLE) {
      throw new ConflictException(
        'La publicación no está disponible para recibir solicitudes',
      );
    }

    if (publicacion.creadorId === solicitanteId) {
      throw new ForbiddenException('No podés solicitar tu propia publicación');
    }

    const solicitudActiva =
      await this.solicitudRepository.buscarSolicitudActiva(
        dto.publicacionId,
        solicitanteId,
      );

    if (solicitudActiva) {
      throw new ConflictException(
        'Ya tenés una solicitud activa para esta publicación',
      );
    }

    const nuevaSolicitud = this.solicitudRepository.crear({
      publicacionId: dto.publicacionId,
      solicitanteId,
      creadorPublicacionId: publicacion.creadorId,
      mensaje: dto.mensaje,
    });

    return this.solicitudRepository.guardar(nuevaSolicitud);
  }

  listarMisSolicitudes(solicitanteId: string): Promise<Solicitud[]> {
    return this.solicitudRepository.listarMias(solicitanteId);
  }

  listarSolicitudesRecibidas(
    creadorPublicacionId: string,
  ): Promise<Solicitud[]> {
    return this.solicitudRepository.listarRecibidas(creadorPublicacionId);
  }

  async rechazarSolicitud(
    solicitudId: string,
    usuarioId: string,
  ): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.creadorPublicacionId !== usuarioId) {
      throw new ForbiddenException(
        'Solo el creador puede rechazar solicitudes',
      );
    }

    solicitud.rechazar();

    return this.solicitudRepository.guardar(solicitud);
  }

  async aceptarSolicitud(
    solicitudId: string,
    usuarioId: string,
  ): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.creadorPublicacionId !== usuarioId) {
      throw new ForbiddenException('Solo el creador puede aceptar solicitudes');
    }

    const publicacion = await this.publicacionService.buscarPublicacionPorId(
      solicitud.publicacionId,
    );

    publicacion.reservar();

    solicitud.aceptar();

    await this.publicacionService.guardar(publicacion);

    return this.solicitudRepository.guardar(solicitud);
  }

  async finalizarSolicitud(
    solicitudId: string,
    usuarioId: string,
  ): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.creadorPublicacionId !== usuarioId) {
      throw new ForbiddenException(
        'Solo el creador puede finalizar la entrega',
      );
    }

    const publicacion = await this.publicacionService.buscarPublicacionPorId(
      solicitud.publicacionId,
    );

    solicitud.finalizar();

    publicacion.entregar();

    const solicitudesPendientes =
      await this.solicitudRepository.buscarPendientesPorPublicacion(
        solicitud.publicacionId,
      );

    for (const pendiente of solicitudesPendientes) {
      if (pendiente.id !== solicitud.id) {
        pendiente.rechazar('La publicación ya fue entregada');

        await this.solicitudRepository.guardar(pendiente);
      }
    }

    await this.publicacionService.guardar(publicacion);

    await this.solicitudRepository.guardar(solicitud);

    return solicitud;
  }
}
