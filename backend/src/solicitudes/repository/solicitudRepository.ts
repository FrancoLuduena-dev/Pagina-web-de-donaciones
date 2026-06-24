import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { Solicitud } from '../entity/solicitudEntity';
import { EstadoSolicitud } from '../enums/estadoSolicitud';

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

  crear(solicitud: Partial<Solicitud>): Solicitud {
    return this.repository.create(solicitud);
  }

  guardar(solicitud: Solicitud): Promise<Solicitud> {
    return this.repository.save(solicitud);
  }

  guardarVarias(solicitudes: Solicitud[]): Promise<Solicitud[]> {
    return this.repository.save(solicitudes);
  }

  buscarPorId(id: string): Promise<Solicitud | null> {
    return this.repository.findOne({
      where: { id },
      relations: this.relacionesSolicitud,
    });
  }

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
