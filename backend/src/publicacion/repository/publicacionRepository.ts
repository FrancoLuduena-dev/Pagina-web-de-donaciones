import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';

import { Publicacion } from '../entity/publicacionEntity';
import { EstadoPublicacion } from '../enums/estadoPublicacion';

@Injectable()
export class PublicacionRepository {
  constructor(
    @InjectRepository(Publicacion)
    private readonly repository: Repository<Publicacion>,
  ) { }

  crear(publicacion: Partial<Publicacion>): Publicacion {
    return this.repository.create(publicacion);
  }

  guardar(publicacion: Publicacion): Promise<Publicacion> {
    return this.repository.save(publicacion);
  }

  buscarPorId(id: string): Promise<Publicacion | null> {
    return this.repository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }

  listarPublico(): Promise<Publicacion[]> {
    return this.repository.find({
      where: {
        estado: EstadoPublicacion.DISPONIBLE,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  listarPorCreador(
    creadorId: string,
    estado?: EstadoPublicacion,
  ): Promise<Publicacion[]> {
    return this.repository.find({
      where: {
        creadorId,
        ...(estado ? { estado } : {}),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
