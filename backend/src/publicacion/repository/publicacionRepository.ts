import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, ILike } from 'typeorm';

import { Publicacion } from '../entity/publicacionEntity';
import { EstadoPublicacion } from '../enums/estadoPublicacion';

@Injectable()
export class PublicacionRepository {
  constructor(
    @InjectRepository(Publicacion)
    private readonly repository: Repository<Publicacion>,
  ) {}

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

  listarPublico(texto?: string): Promise<Publicacion[]> {
    if (!texto) {
      return this.repository.find({
        where: {
          estado: EstadoPublicacion.DISPONIBLE,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    }

    return this.repository.find({
      where: [
        {
          estado: EstadoPublicacion.DISPONIBLE,
          titulo: ILike(`%${texto}%`),
        },
        {
          estado: EstadoPublicacion.DISPONIBLE,
          descripcion: ILike(`%${texto}%`),
        },
      ],
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