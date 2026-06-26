import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { Notificacion } from '../entity/notificacionEntity';

/**
 * Repositorio encargado del acceso a datos de las notificaciones.
 *
 * Centraliza las consultas y operaciones de persistencia necesarias para listar,
 * contar, buscar y actualizar el estado de lectura de las notificaciones.
 */
@Injectable()
export class NotificacionRepository {
  constructor(
    @InjectRepository(Notificacion)
    private readonly repository: Repository<Notificacion>,
  ) {}

  /**
   * Crea una instancia de notificación sin persistirla aún.
   *
   * @param datos Datos iniciales de la notificación.
   * @returns Instancia preparada para guardar.
   */
  crear(datos: Partial<Notificacion>): Notificacion {
    return this.repository.create(datos);
  }

  /**
   * Persiste una notificación en la base de datos.
   *
   * @param notificacion Notificación a guardar.
   * @returns Notificación persistida.
   */
  guardar(notificacion: Notificacion): Promise<Notificacion> {
    return this.repository.save(notificacion);
  }

  /**
   * Lista las notificaciones de un destinatario con paginación.
   *
   * @param destinatarioId Identificador del destinatario.
   * @param pagina Número de página.
   * @param limite Cantidad máxima de registros por página.
   * @returns Tupla con las notificaciones encontradas y el total.
   */
  listarPorDestinatario(
    destinatarioId: string,
    pagina: number,
    limite: number,
  ): Promise<[Notificacion[], number]> {
    return this.repository.findAndCount({
      where: { destinatarioId },
      relations: ['solicitud', 'denuncia'],
      order: { creadaEn: 'DESC' },
      skip: (pagina - 1) * limite,
      take: limite,
    });
  }

  /**
   * Cuenta las notificaciones sin leer de un destinatario.
   *
   * @param destinatarioId Identificador del destinatario.
   * @returns Cantidad de notificaciones sin leer.
   */
  contarNoLeidas(destinatarioId: string): Promise<number> {
    return this.repository.count({
      where: {
        destinatarioId,
        leidaEn: IsNull(),
      },
    });
  }

  /**
   * Busca una notificación por su identificador y por el destinatario.
   *
   * @param id Identificador de la notificación.
   * @param destinatarioId Identificador del destinatario.
   * @returns Notificación encontrada o null si no pertenece al destinatario.
   */
  buscarPorIdYDestinatario(
    id: string,
    destinatarioId: string,
  ): Promise<Notificacion | null> {
    return this.repository.findOne({
      where: {
        id,
        destinatarioId,
      },
      relations: ['solicitud', 'denuncia'],
    });
  }

  /**
   * Marca como leídas todas las notificaciones pendientes del destinatario.
   *
   * @param destinatarioId Identificador del destinatario.
   */
  async marcarTodasComoLeidas(destinatarioId: string): Promise<void> {
    await this.repository.update(
      {
        destinatarioId,
        leidaEn: IsNull(),
      },
      {
        leidaEn: new Date(),
      },
    );
  }
}
