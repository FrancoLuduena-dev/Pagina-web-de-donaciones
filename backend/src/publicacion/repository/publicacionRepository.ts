import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, ILike } from 'typeorm';
import { Publicacion } from '../entity/publicacionEntity';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { FiltrosPublicacionDto } from '../dtos/filtrosPublicacionDto';

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

  listarPublico(filtros: FiltrosPublicacionDto): Promise<Publicacion[]> {
    const { q, categoriaId } = filtros;

    if (!q) {
      return this.repository.find({
        where: {
          estado: EstadoPublicacion.DISPONIBLE,
          deletedAt: IsNull(),
          ...(categoriaId ? { categoriaId } : {}),
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
          deletedAt: IsNull(),
          ...(categoriaId ? { categoriaId } : {}),
          titulo: ILike(`%${q}%`),
        },
        {
          estado: EstadoPublicacion.DISPONIBLE,
          deletedAt: IsNull(),
          ...(categoriaId ? { categoriaId } : {}),
          descripcion: ILike(`%${q}%`),
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
        deletedAt: IsNull(),
        ...(estado ? { estado } : {}),
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
