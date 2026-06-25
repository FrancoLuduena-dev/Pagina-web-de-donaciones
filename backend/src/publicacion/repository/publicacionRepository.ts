import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, IsNull, Repository } from 'typeorm';
import { Publicacion } from '../entity/publicacionEntity';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { FiltrosPublicacionDto } from '../dtos/filtrosPublicacionDto';

/**
 * Repositorio encargado del acceso a datos de las publicaciones.
 *
 * Centraliza las consultas y persistencia de publicaciones, incluyendo las
 * restricciones de visibilidad y filtrado según el estado del registro.
 */
@Injectable()
export class PublicacionRepository {
  constructor(
    @InjectRepository(Publicacion)
    private readonly repository: Repository<Publicacion>,
  ) {}

  /**
   * Crea una instancia de publicación sin persistirla aún.
   *
   * @param publicacion Datos iniciales de la publicación.
   * @returns Instancia de publicación preparada para guardar.
   */
  crear(publicacion: Partial<Publicacion>): Publicacion {
    return this.repository.create(publicacion);
  }

  /**
   * Persiste una publicación en la base de datos.
   *
   * @param publicacion Publicación a guardar.
   * @returns Publicación persistida.
   */
  guardar(publicacion: Publicacion): Promise<Publicacion> {
    return this.repository.save(publicacion);
  }

  /**
   * Busca una publicación activa por su identificador.
   *
   * Excluye las publicaciones marcadas como eliminadas de forma lógica.
   *
   * @param id Identificador de la publicación.
   * @returns Publicación encontrada o null si no existe.
   */
  buscarPorId(id: string): Promise<Publicacion | null> {
    return this.repository.findOne({
      where: {
        id,
        deletedAt: IsNull(),
      },
    });
  }

  /**
   * Lista publicaciones visibles para el público.
   *
   * Aplica filtros de estado, categoría, localidad, condición y texto de
   * búsqueda, y excluye aquellas que fueron eliminadas lógicamente.
   *
   * @param filtros Filtros de búsqueda para el listado público.
   * @returns Publicaciones públicas que cumplen con los filtros.
   */
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

  /**
   * Lista las publicaciones asociadas a un creador.
   *
   * Permite filtrar por estado para consultar el historial o el estado actual
   * de las publicaciones del usuario.
   *
   * @param creadorId Identificador del creador.
   * @param estado Estado opcional para filtrar las publicaciones.
   * @returns Publicaciones del creador que coinciden con el filtro.
   */
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
