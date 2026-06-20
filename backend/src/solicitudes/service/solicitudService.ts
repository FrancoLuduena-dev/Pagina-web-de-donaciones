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
import { SolicitudResponseDto } from '../DTO/solicitudResponse';

@Injectable()
export class SolicitudService {
  constructor(
    private readonly solicitudRepository: SolicitudRepository,
    private readonly publicacionService: PublicacionService,
  ) {}

  async crearSolicitud(
    dto: CrearSolicitudDto,
    solicitanteId: string,
  ): Promise<SolicitudResponseDto> {
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

    const solicitudGuardada =
      await this.solicitudRepository.guardar(nuevaSolicitud);

    const solicitudCompleta = await this.obtenerSolicitudPorId(
      solicitudGuardada.id,
    );

    return this.mapearRespuesta(solicitudCompleta, solicitanteId);
  }

  async listarMisSolicitudes(
    solicitanteId: string,
  ): Promise<SolicitudResponseDto[]> {
    const solicitudes =
      await this.solicitudRepository.listarMias(solicitanteId);

    return solicitudes.map((solicitud) =>
      this.mapearRespuesta(solicitud, solicitanteId),
    );
  }

  async listarSolicitudesRecibidas(
    creadorPublicacionId: string,
  ): Promise<SolicitudResponseDto[]> {
    const solicitudes =
      await this.solicitudRepository.listarRecibidas(creadorPublicacionId);

    return solicitudes.map((solicitud) =>
      this.mapearRespuesta(solicitud, creadorPublicacionId),
    );
  }

  async rechazarSolicitud(
    solicitudId: string,
    usuarioId: string,
    dto: RechazarSolicitudDto,
  ): Promise<SolicitudResponseDto> {
    const solicitud = await this.obtenerSolicitudPorId(solicitudId);

    solicitud.validarCreadorPublicacion(
      usuarioId,
      'Solo el creador puede rechazar solicitudes',
    );

    solicitud.rechazar(dto.motivo);

    const solicitudGuardada = await this.solicitudRepository.guardar(solicitud);

    return this.mapearRespuesta(solicitudGuardada, usuarioId);
  }

  async aceptarSolicitud(
    solicitudId: string,
    usuarioId: string,
  ): Promise<SolicitudResponseDto> {
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

    const solicitudGuardada = await this.solicitudRepository.guardar(solicitud);

    return this.mapearRespuesta(solicitudGuardada, usuarioId);
  }

  async finalizarSolicitud(
    solicitudId: string,
    usuarioId: string,
  ): Promise<SolicitudResponseDto> {
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

    const solicitudGuardada = await this.solicitudRepository.guardar(solicitud);

    return this.mapearRespuesta(solicitudGuardada, usuarioId);
  }
  async cancelarSolicitud(
    solicitudId: string,
    usuarioId: string,
    dto: CancelarSolicitudDto,
  ): Promise<SolicitudResponseDto> {
    const solicitud = await this.obtenerSolicitudPorId(solicitudId);

    solicitud.validarPuedeCancelarsePor(usuarioId);

    const debeLiberarPublicacion =
      solicitud.estado === EstadoSolicitud.ACEPTADA;

    if (debeLiberarPublicacion) {
      solicitud.cancelarAceptada(
        dto.motivo ?? 'Solicitud cancelada luego de haber sido aceptada',
      );

      const publicacion = await this.publicacionService.buscarPublicacionPorId(
        solicitud.publicacionId,
      );

      publicacion.cancelarReserva();

      await this.publicacionService.guardar(publicacion);
    } else {
      solicitud.cancelar(dto.motivo);
    }

    const solicitudGuardada = await this.solicitudRepository.guardar(solicitud);

    return this.mapearRespuesta(solicitudGuardada, usuarioId);
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

  private mapearRespuesta(
    solicitud: Solicitud,
    usuarioActualId: string,
  ): SolicitudResponseDto {
    return SolicitudResponseDto.desdeEntidad(solicitud, usuarioActualId);
  }
}
