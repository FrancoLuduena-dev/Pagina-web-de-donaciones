import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';

import { PublicacionService } from '../../publicacion/service/publicacionService';
import { SolicitudCreadaEvent } from '../evento/solicitudCreadaEvento';
import { SolicitudRechazadaEvent } from '../evento/solicitudRechazadaEvento';
import { CrearSolicitudDto } from '../DTO/crearSolicitudDto';
import { RechazarSolicitudDto } from '../DTO/rechazarSolicitudDto';
import { CancelarSolicitudDto } from '../DTO/cancelarSolicitudDto';
import { SolicitudResponseDto } from '../DTO/solicitudResponse';
import { Solicitud } from '../entity/solicitudEntity';
import { EstadoSolicitud } from '../enums/estadoSolicitud';
import { SolicitudRepository } from '../repository/solicitudRepository';
import { EventoDominio } from 'src/compartidos/evento/eventoDominio';
import { SolicitudAceptadaEvent } from '../evento/solicitudAceptadaEvento';
import { SolicitudAceptadaCanceladaEvento } from '../evento/solicitudAceptadaCanceladaEvento';
import { SolicitudFinalizadaEvento } from '../evento/solicitudFinalizadaEvento';

@Injectable()
export class SolicitudService {
  constructor(
    private readonly solicitudRepository: SolicitudRepository,
    private readonly publicacionService: PublicacionService,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
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

    this.eventEmitter.emit(
      EventoDominio.SOLICITUD_CREADA,
      new SolicitudCreadaEvent(
        solicitudGuardada.id,
        publicacion.creadorId,
        publicacion.titulo,
      ),
    );

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

    this.eventEmitter.emit(
      EventoDominio.SOLICITUD_RECHAZADA,
      new SolicitudRechazadaEvent(
        solicitudGuardada.id,
        solicitudGuardada.solicitanteId,
        solicitud.publicacion.titulo,
        solicitudGuardada.motivoRechazo,
      ),
    );

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

    const solicitudGuardada = await this.dataSource.transaction(
      async (manager) => {
        await manager.save(publicacion);
        return manager.save(solicitud);
      },
    );

    this.eventEmitter.emit(
      EventoDominio.SOLICITUD_ACEPTADA,
      new SolicitudAceptadaEvent(
        solicitudGuardada.id,
        solicitudGuardada.solicitanteId,
        publicacion.titulo,
      ),
    );

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

    const solicitudGuardada = await this.dataSource.transaction(
      async (manager) => {
        const solicitudesPendientes = await manager.find(Solicitud, {
          where: {
            publicacionId: solicitud.publicacionId,
            estado: EstadoSolicitud.PENDIENTE,
          },
        });

        for (const pendiente of solicitudesPendientes) {
          pendiente.rechazar('La publicación ya fue entregada');
        }

        if (solicitudesPendientes.length > 0) {
          await manager.save(solicitudesPendientes);
        }

        await manager.save(publicacion);
        return manager.save(solicitud);
      },
    );

    this.eventEmitter.emit(
      EventoDominio.SOLICITUD_FINALIZADA,
      new SolicitudFinalizadaEvento(
        solicitudGuardada.id,
        solicitudGuardada.solicitanteId,
        publicacion.titulo,
      ),
    );

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

    let solicitudGuardada: Solicitud;

    if (debeLiberarPublicacion) {
      const motivo =
        dto.motivo ?? 'Solicitud cancelada luego de haber sido aceptada';

      solicitud.cancelarAceptada(motivo);

      const publicacion = await this.publicacionService.buscarPublicacionPorId(
        solicitud.publicacionId,
      );

      publicacion.cancelarReserva();

      solicitudGuardada = await this.dataSource.transaction(async (manager) => {
        await manager.save(publicacion);
        return manager.save(solicitud);
      });

      this.eventEmitter.emit(
        EventoDominio.SOLICITUD_ACEPTADA_CANCELADA,
        new SolicitudAceptadaCanceladaEvento(
          solicitudGuardada.id,
          solicitudGuardada.solicitanteId,
          publicacion.titulo,
          motivo,
        ),
      );
    } else {
      solicitud.cancelar(dto.motivo);
      solicitudGuardada = await this.solicitudRepository.guardar(solicitud);
    }

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
