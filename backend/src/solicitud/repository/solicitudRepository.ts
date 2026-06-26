import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Solicitud } from '../entity/solicitudEntity';
import { EstadoSolicitud } from '../enums/estadoSolicitud';

/**
 * Repositorio encargado del acceso a datos de las solicitudes.
 *
 * Centraliza las consultas y persistencia relacionadas con la búsqueda de
 * solicitudes activas, recibidas, pendientes y aceptadas para el flujo de negocio.
 */
@Injectable()
export class SolicitudRepository {
  private readonly relacionesSolicitud: string[] = [
    'publicacion',
    'solicitante',
    'creadorPublicacion',
  ];

  constructor(
    @InjectRepository(Solicitud)
    private readonly repository: Repository<Solicitud>,
  ) {}

  /**
   * Crea una instancia de solicitud sin persistirla aún.
   *
   * @param solicitud Datos iniciales de la solicitud.
   * @returns Instancia preparada para ser guardada.
   */
  crear(solicitud: Partial<Solicitud>): Solicitud {
    return this.repository.create(solicitud);
  }

  /**
   * Persiste una solicitud en la base de datos.
   *
   * @param solicitud Solicitud a guardar.
   * @returns Solicitud persistida.
   */
  guardar(solicitud: Solicitud): Promise<Solicitud> {
    return this.repository.save(solicitud);
  }

  /**
   * Persiste varias solicitudes en una sola operación.
   *
   * @param solicitudes Solicitudes a guardar.
   * @returns Solicitudes persistidas.
   */
  guardarVarias(solicitudes: Solicitud[]): Promise<Solicitud[]> {
    return this.repository.save(solicitudes);
  }

  /**
   * Busca una solicitud por su identificador con sus relaciones principales.
   *
   * @param id Identificador de la solicitud.
   * @returns Solicitud encontrada o null si no existe.
   */
  buscarPorId(id: string): Promise<Solicitud | null> {
    return this.repository.findOne({
      where: { id },
      relations: this.relacionesSolicitud,
    });
  }

  /**
   * Busca una solicitud activa para una publicación y un solicitante.
   *
   * Se considera activa una solicitud pendiente o aceptada, lo que evita que un
   * usuario genere múltiples solicitudes sobre la misma publicación.
   *
   * @param publicacionId Identificador de la publicación.
   * @param solicitanteId Identificador del usuario solicitante.
   * @returns Solicitud activa encontrada o null si no existe.
   */
  buscarSolicitudActiva(
    publicacionId: string,
    solicitanteId: string,
  ): Promise<Solicitud | null> {
    return this.repository.findOne({
      where: {
        publicacionId,
        solicitanteId,
        estado: In([EstadoSolicitud.PENDIENTE, EstadoSolicitud.ACEPTADA]),
      },
      relations: this.relacionesSolicitud,
    });
  }

  listarMias(solicitanteId: string): Promise<Solicitud[]> {
    return this.repository.find({
      where: { solicitanteId },
      relations: this.relacionesSolicitud,
      order: { createdAt: 'DESC' },
    });
  }

  listarRecibidas(creadorPublicacionId: string): Promise<Solicitud[]> {
    return this.repository.find({
      where: { creadorPublicacionId },
      relations: this.relacionesSolicitud,
      order: { createdAt: 'DESC' },
    });
  }

  buscarPendientesPorPublicacion(publicacionId: string): Promise<Solicitud[]> {
    return this.repository.find({
      where: {
        publicacionId,
        estado: EstadoSolicitud.PENDIENTE,
      },
      relations: this.relacionesSolicitud,
    });
  }

  buscarActivasPorPublicacion(publicacionId: string): Promise<Solicitud[]> {
    return this.repository.find({
      where: {
        publicacionId,
        estado: In([EstadoSolicitud.PENDIENTE, EstadoSolicitud.ACEPTADA]),
      },
      relations: this.relacionesSolicitud,
    });
  }

  /**
   * Busca la solicitud aceptada asociada a una publicación.
   *
   * @param publicacionId Identificador de la publicación.
   * @returns Solicitud aceptada encontrada o null si no existe.
   */
  buscarAceptadaPorPublicacion(
    publicacionId: string,
  ): Promise<Solicitud | null> {
    return this.repository.findOne({
      where: {
        publicacionId,
        estado: EstadoSolicitud.ACEPTADA,
      },
      relations: this.relacionesSolicitud,
    });
  }
}
