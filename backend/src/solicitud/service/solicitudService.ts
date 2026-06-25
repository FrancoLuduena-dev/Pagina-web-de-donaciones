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
import { CrearSolicitudDto } from '../dtos/crearSolicitudDto';
import { RechazarSolicitudDto } from '../dtos/rechazarSolicitudDto';
import { CancelarSolicitudDto } from '../dtos/cancelarSolicitudDto';
import { SolicitudResponseDto } from '../dtos/solicitudResponse';
import { Solicitud } from '../entity/solicitudEntity';
import { EstadoSolicitud } from '../enums/estadoSolicitud';
import { SolicitudRepository } from '../repository/solicitudRepository';
import { EventoDominio } from 'src/compartidos/evento/eventoDominio';
import { SolicitudAceptadaEvent } from '../evento/solicitudAceptadaEvento';
import { SolicitudAceptadaCanceladaEvento } from '../evento/solicitudAceptadaCanceladaEvento';
import { SolicitudFinalizadaEvento } from '../evento/solicitudFinalizadaEvento';
import { Publicacion } from 'src/publicacion/entity/publicacionEntity';

/**
 * Servicio encargado de aplicar las reglas de negocio del ciclo de vida de las solicitudes.
 *
 * Coordina validaciones sobre la publicación relacionada, las decisiones del
 * creador, los cambios de estado de la solicitud y los eventos de dominio que
 * se disparan cuando el proceso avanza.
 */
@Injectable()
export class SolicitudService {
  constructor(
    private readonly solicitudRepository: SolicitudRepository,
    private readonly publicacionService: PublicacionService,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea una nueva solicitud sobre una publicación.
   *
   * Antes de persistirla, el servicio valida que la publicación pueda recibir
   * solicitudes, que el usuario no sea el creador y que no exista ya una
   * solicitud activa para esa publicación.
   *
   * @param dto Datos de la solicitud enviada por el usuario.
   * @param solicitanteId Identificador del usuario que realiza la solicitud.
   * @returns Solicitud creada serializada para la respuesta.
   * @throws ForbiddenException Si el usuario intenta solicitar su propia publicación.
   * @throws ConflictException Si ya existe una solicitud activa para la publicación.
   */
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

  /**
   * Rechaza una solicitud pendiente.
   *
   * El rechazo representa la decisión del creador de no avanzar con esa
   * solicitud y deja el proceso cerrado para ese intento.
   *
   * @param solicitudId Identificador de la solicitud a rechazar.
   * @param usuarioId Identificador del usuario que intenta rechazarla.
   * @param dto Datos del rechazo, incluyendo el motivo opcional.
   * @returns Solicitud actualizada serializada para la respuesta.
   */
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

  /**
   * Acepta una solicitud pendiente.
   *
   * Esta operación compromete la publicación con un usuario y, por eso,
   * el servicio también reserva la publicación para evitar que siga estando
   * disponible para otros interesados. La ejecución se realiza dentro de una
   * transacción con bloqueo para evitar inconsistencias.
   *
   * @param solicitudId Identificador de la solicitud a aceptar.
   * @param usuarioId Identificador del usuario que intenta aceptar la solicitud.
   * @returns Solicitud aceptada serializada para la respuesta.
   */
  async aceptarSolicitud(
    solicitudId: string,
    usuarioId: string,
  ): Promise<SolicitudResponseDto> {
    const { solicitudGuardada, publicacion } =
      await this.dataSource.transaction(async (manager) => {
        const solicitud = await manager.findOne(Solicitud, {
          where: { id: solicitudId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!solicitud) {
          throw new NotFoundException('Solicitud no encontrada');
        }

        solicitud.validarCreadorPublicacion(
          usuarioId,
          'Solo el creador puede aceptar solicitudes',
        );

        const publicacion = await manager.findOne(Publicacion, {
          where: { id: solicitud.publicacionId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!publicacion) {
          throw new NotFoundException('Publicación no encontrada');
        }

        publicacion.validarPuedeRecibirSolicitudes();

        solicitud.aceptar();
        publicacion.reservar();

        await manager.save(publicacion);
        const solicitudGuardada = await manager.save(solicitud);

        return { solicitudGuardada, publicacion };
      });

    this.eventEmitter.emit(
      EventoDominio.SOLICITUD_ACEPTADA,
      new SolicitudAceptadaEvent(
        solicitudGuardada.id,
        solicitudGuardada.solicitanteId,
        publicacion.titulo,
      ),
    );

    const solicitudCompleta = await this.obtenerSolicitudPorId(
      solicitudGuardada.id,
    );

    return this.mapearRespuesta(solicitudCompleta, usuarioId);
  }
  /**
   * Finaliza una solicitud aceptada y concluye el proceso de entrega.
   *
   * Al completarse la entrega, la publicación pasa a un estado de finalización
   * y las solicitudes pendientes restantes sobre esa publicación se rechazan
   * para evitar nuevos compromisos sobre un recurso ya entregado.
   *
   * @param solicitudId Identificador de la solicitud a finalizar.
   * @param usuarioId Identificador del usuario que realiza la finalización.
   * @returns Solicitud finalizada serializada para la respuesta.
   */
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

    const { solicitudGuardada, solicitudesRechazadas } =
      await this.dataSource.transaction(async (manager) => {
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
        const solicitudGuardada = await manager.save(solicitud);

        return {
          solicitudGuardada,
          solicitudesRechazadas: solicitudesPendientes,
        };
      });

    for (const solicitudRechazada of solicitudesRechazadas) {
      this.eventEmitter.emit(
        EventoDominio.SOLICITUD_RECHAZADA,
        new SolicitudRechazadaEvent(
          solicitudRechazada.id,
          solicitudRechazada.solicitanteId,
          publicacion.titulo,
          solicitudRechazada.motivoRechazo,
        ),
      );
    }

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

  async finalizarEntregaPorPublicacion(
    publicacionId: string,
    usuarioId: string,
  ): Promise<SolicitudResponseDto> {
    const solicitud =
      await this.solicitudRepository.buscarAceptadaPorPublicacion(
        publicacionId,
      );

    if (!solicitud) {
      throw new NotFoundException(
        'No hay una solicitud aceptada para esta publicación',
      );
    }

    return this.finalizarSolicitud(solicitud.id, usuarioId);
  }

  async cancelarReservaPorPublicacion(
    publicacionId: string,
    usuarioId: string,
    dto: CancelarSolicitudDto,
  ): Promise<SolicitudResponseDto> {
    const solicitud =
      await this.solicitudRepository.buscarAceptadaPorPublicacion(
        publicacionId,
      );

    if (!solicitud) {
      throw new NotFoundException(
        'No hay una solicitud aceptada para esta publicación',
      );
    }

    return this.cancelarSolicitud(solicitud.id, usuarioId, dto);
  }

  /**
   * Cancela una solicitud según el estado actual de la misma.
   *
   * Si la solicitud estaba pendiente, se cancela de forma simple. Si ya había
   * sido aceptada, se libera la reserva de la publicación para que vuelva a
   * estar disponible para otros usuarios.
   *
   * @param solicitudId Identificador de la solicitud a cancelar.
   * @param usuarioId Identificador del usuario que intenta cancelarla.
   * @param dto Datos de cancelación, incluyendo el motivo opcional.
   * @returns Solicitud cancelada serializada para la respuesta.
   */
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

  async resolverSolicitudesPorPublicacionEliminada(
    publicacionId: string,
    publicacionTitulo: string,
    eliminadaPorModeracion: boolean,
  ): Promise<number> {
    const solicitudesActivas =
      await this.solicitudRepository.buscarActivasPorPublicacion(publicacionId);

    const solicitudesAResolver = solicitudesActivas.filter(
      (solicitud) =>
        solicitud.estado === EstadoSolicitud.PENDIENTE ||
        solicitud.estado === EstadoSolicitud.ACEPTADA,
    );

    if (solicitudesAResolver.length === 0) {
      return 0;
    }

    const motivo = eliminadaPorModeracion
      ? 'La publicación fue eliminada por moderación'
      : 'La publicación fue eliminada';
    const solicitudesAceptadas = new Set(
      solicitudesAResolver
        .filter((solicitud) => solicitud.estado === EstadoSolicitud.ACEPTADA)
        .map((solicitud) => solicitud.id),
    );

    for (const solicitud of solicitudesAResolver) {
      if (solicitud.estado === EstadoSolicitud.PENDIENTE) {
        solicitud.rechazar(motivo);
      } else {
        solicitud.cancelarAceptada(motivo);
      }
    }

    const solicitudesGuardadas =
      await this.solicitudRepository.guardarVarias(solicitudesAResolver);

    for (const solicitud of solicitudesGuardadas) {
      if (solicitudesAceptadas.has(solicitud.id)) {
        this.eventEmitter.emit(
          EventoDominio.SOLICITUD_ACEPTADA_CANCELADA,
          new SolicitudAceptadaCanceladaEvento(
            solicitud.id,
            solicitud.solicitanteId,
            publicacionTitulo,
            motivo,
          ),
        );
      } else {
        this.eventEmitter.emit(
          EventoDominio.SOLICITUD_RECHAZADA,
          new SolicitudRechazadaEvent(
            solicitud.id,
            solicitud.solicitanteId,
            publicacionTitulo,
            motivo,
          ),
        );
      }
    }

    return solicitudesGuardadas.length;
  }

  private mapearRespuesta(
    solicitud: Solicitud,
    usuarioActualId: string,
  ): SolicitudResponseDto {
    return SolicitudResponseDto.desdeEntidad(solicitud, usuarioActualId);
  }
}
