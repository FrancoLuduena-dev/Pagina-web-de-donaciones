import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
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
    const { q, categoriaId, localidadId, condicion, estado } = filtros;

    if (estado === EstadoPublicacion.ELIMINADA) {
      throw new BadRequestException(
        'Las publicaciones eliminadas no se muestran en el listado público',
      );
    }

    const estadoFiltro = estado ?? EstadoPublicacion.DISPONIBLE;

    const filtrosBase: FindOptionsWhere<Publicacion> = {
      estado: estadoFiltro,
      deletedAt: IsNull(),
      ...(categoriaId ? { categoriaId } : {}),
      ...(localidadId ? { localidadId } : {}),
      ...(condicion ? { condicion } : {}),
    };

    const textoBusqueda = q?.trim();

    if (!textoBusqueda) {
      return this.repository.find({
        where: filtrosBase,
        order: {
          createdAt: 'DESC',
        },
      });
    }

    return this.repository.find({
      where: [
        {
          ...filtrosBase,
          titulo: ILike(`%${textoBusqueda}%`),
        },
        {
          ...filtrosBase,
          descripcion: ILike(`%${textoBusqueda}%`),
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
