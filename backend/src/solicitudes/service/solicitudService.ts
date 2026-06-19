import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Solicitud } from '../entity/solicitudEntity';
import { SolicitudRepository } from '../repository/solicitudRepository';
import { PublicacionService } from '../../publicacion/service/publicacionService';
import { CrearSolicitudDto } from '../DTO/crearSolicitudDto';
import { RechazarSolicitudDto } from '../DTO/rechazarSolicitudDto';
import { CancelarSolicitudDto } from '../DTO/cancelarSolicitudDto';
import { EstadoSolicitud } from '../enums/estadoSolicitud';

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

    publicacion.validarPuedeRecibirSolicitudes();

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
    dto: RechazarSolicitudDto,
  ): Promise<Solicitud> {
    const solicitud = await this.obtenerSolicitudPorId(solicitudId);

    solicitud.validarCreadorPublicacion(
      usuarioId,
      'Solo el creador puede rechazar solicitudes',
    );

    solicitud.rechazar(dto.motivo);

    return this.solicitudRepository.guardar(solicitud);
  }

  async aceptarSolicitud(
    solicitudId: string,
    usuarioId: string,
  ): Promise<Solicitud> {
    const solicitud = await this.obtenerSolicitudPorId(solicitudId);

    solicitud.validarCreadorPublicacion(
      usuarioId,
      'Solo el creador puede aceptar solicitudes',
    );

    const publicacion = await this.publicacionService.buscarPublicacionPorId(
      solicitud.publicacionId,
    );

    publicacion.validarPuedeRecibirSolicitudes();

    solicitud.aceptar();
    publicacion.reservar();

    await this.publicacionService.guardar(publicacion);

    return this.solicitudRepository.guardar(solicitud);
  }

  async finalizarSolicitud(
    solicitudId: string,
    usuarioId: string,
  ): Promise<Solicitud> {
    const solicitud = await this.obtenerSolicitudPorId(solicitudId);

    solicitud.validarCreadorPublicacion(
      usuarioId,
      'Solo el creador puede finalizar la entrega',
    );

    const publicacion = await this.publicacionService.buscarPublicacionPorId(
      solicitud.publicacionId,
    );

    solicitud.finalizar();
    publicacion.entregar();

    await this.rechazarSolicitudesPendientesRestantes(
      solicitud.publicacionId,
      solicitud.id,
    );

    await this.publicacionService.guardar(publicacion);
    return this.solicitudRepository.guardar(solicitud);
  }

  async cancelarSolicitud(
    solicitudId: string,
    usuarioId: string,
    dto: CancelarSolicitudDto,
  ): Promise<Solicitud> {
    const solicitud = await this.obtenerSolicitudPorId(solicitudId);

    solicitud.validarPuedeCancelarsePor(usuarioId);

    const debeLiberarPublicacion =
      solicitud.estado === EstadoSolicitud.ACEPTADA;

    solicitud.cancelar(dto.motivo);

    if (debeLiberarPublicacion) {
      const publicacion = await this.publicacionService.buscarPublicacionPorId(
        solicitud.publicacionId,
      );

      publicacion.cancelarReserva();

      await this.publicacionService.guardar(publicacion);
    }

    return this.solicitudRepository.guardar(solicitud);
  }

  private async obtenerSolicitudPorId(solicitudId: string): Promise<Solicitud> {
    const solicitud = await this.solicitudRepository.buscarPorId(solicitudId);

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    return solicitud;
  }

  private async rechazarSolicitudesPendientesRestantes(
    publicacionId: string,
    solicitudFinalizadaId: string,
  ): Promise<void> {
    const solicitudesPendientes =
      await this.solicitudRepository.buscarPendientesPorPublicacion(
        publicacionId,
      );

    const solicitudesARechazar = solicitudesPendientes.filter(
      (pendiente) => pendiente.id !== solicitudFinalizadaId,
    );

    for (const pendiente of solicitudesARechazar) {
      pendiente.rechazar('La publicación ya fue entregada');
    }

    await this.solicitudRepository.guardarVarias(solicitudesARechazar);
  }
}
