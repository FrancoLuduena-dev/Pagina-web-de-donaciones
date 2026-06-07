// src/solicitud/repository/solicitudRepository.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Solicitud } from '../entity/solicitudEntity';
import { EstadoSolicitud } from '../enums/estadoSolicitud';

@Injectable()
export class SolicitudRepository {
  constructor(
    @InjectRepository(Solicitud)
    private readonly repository: Repository<Solicitud>,
  ) {}

  crear(solicitud: Partial<Solicitud>): Solicitud {
    return this.repository.create(solicitud);
  }

  guardar(solicitud: Solicitud): Promise<Solicitud> {
    return this.repository.save(solicitud);
  }

  buscarPorId(id: string): Promise<Solicitud | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

  buscarSolicitudActiva(
    publicacionId: string,
    solicitanteId: string,
  ): Promise<Solicitud | null> {
    return this.repository.findOne({
      where: [
        {
          publicacionId,
          solicitanteId,
          estado: EstadoSolicitud.PENDIENTE,
        },
        {
          publicacionId,
          solicitanteId,
          estado: EstadoSolicitud.ACEPTADA,
        },
      ],
    });
  }

  listarMias(solicitanteId: string): Promise<Solicitud[]> {
    return this.repository.find({
      where: { solicitanteId },
      order: { createdAt: 'DESC' },
    });
  }

  listarRecibidas(creadorPublicacionId: string): Promise<Solicitud[]> {
    return this.repository.find({
      where: { creadorPublicacionId },
      order: { createdAt: 'DESC' },
    });
  }

  async buscarPendientesPorPublicacion(
    publicacionId: string,
  ): Promise<Solicitud[]> {
    return this.repository.find({
      where: {
        publicacionId,
        estado: EstadoSolicitud.PENDIENTE,
      },
    });
  }
}
