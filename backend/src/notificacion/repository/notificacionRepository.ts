import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { Notificacion } from '../entity/notificacionEntity';

@Injectable()
export class NotificacionRepository {
  constructor(
    @InjectRepository(Notificacion)
    private readonly repository: Repository<Notificacion>,
  ) {}

  crear(datos: Partial<Notificacion>): Notificacion {
    return this.repository.create(datos);
  }

  guardar(notificacion: Notificacion): Promise<Notificacion> {
    return this.repository.save(notificacion);
  }

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

  contarNoLeidas(destinatarioId: string): Promise<number> {
    return this.repository.count({
      where: {
        destinatarioId,
        leidaEn: IsNull(),
      },
    });
  }

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
