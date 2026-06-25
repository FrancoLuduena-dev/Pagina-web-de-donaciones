import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Denuncia } from '../entity/denunciaEntity';
import { FiltroDenunciaDto } from '../dtos/filtroDenunciaDto';

/**
 * Repositorio encargado del acceso a datos de las denuncias.
 *
 * Centraliza las operaciones de creación, guardado y consulta de denuncias
 * utilizando el repositorio de TypeORM asociado a la entidad Denuncia.
 */
@Injectable()
export class DenunciaRepository {
  constructor(
    @InjectRepository(Denuncia)
    private readonly repository: Repository<Denuncia>,
  ) {}
  /**
   * Crea una instancia de denuncia sin persistirla todavía.
   *
   * @param denuncia Datos iniciales de la denuncia.
   * @returns Instancia de Denuncia creada por TypeORM.
   */
  crear(denuncia: Partial<Denuncia>): Denuncia {
    return this.repository.create(denuncia);
  }

  /**
   * Guarda una denuncia en la base de datos.
   *
   * Se utiliza tanto para persistir una nueva denuncia como para actualizar
   * una denuncia existente.
   *
   * @param denuncia Denuncia que se desea guardar.
   * @returns Denuncia persistida.
   */
  guardar(denuncia: Denuncia): Promise<Denuncia> {
    return this.repository.save(denuncia);
  }

  /**
   * Busca una denuncia por su identificador.
   *
   * Se utiliza cuando el repositorio necesita obtener una denuncia existente
   * antes de devolver su detalle o continuar con una operación.
   *
   * @param id Identificador de la denuncia.
   * @returns Denuncia encontrada o null si no existe.
   */
  buscarPorId(id: string): Promise<Denuncia | null> {
    return this.repository.findOne({
      where: { id },
    });
  }
  /**
   * Busca una denuncia realizada por un usuario sobre una publicación.
   *
   * Se utiliza para evitar que un mismo usuario denuncie más de una vez
   * la misma publicación.
   *
   * @param denuncianteId Identificador del usuario que realizó la denuncia.
   * @param publicacionId Identificador de la publicación denunciada.
   * @returns Denuncia encontrada o null si no existe.
   */
  buscarPorDenuncianteYPublicacion(
    denuncianteId: string,
    publicacionId: string,
  ): Promise<Denuncia | null> {
    return this.repository.findOne({
      where: {
        denuncianteId,
        publicacionId,
      },
    });
  }
  /**
   * Lista denuncias aplicando los filtros disponibles.
   *
   * Permite filtrar por estado y por publicación. Los resultados se ordenan
   * por fecha de creación de forma ascendente.
   *
   * @param filtros Filtros utilizados para consultar denuncias.
   * @returns Lista de denuncias que coinciden con los filtros.
   */
  listar(filtros: FiltroDenunciaDto): Promise<Denuncia[]> {
    return this.repository.find({
      where: {
        ...(filtros.estado ? { estado: filtros.estado } : {}),
        ...(filtros.publicacionId
          ? { publicacionId: filtros.publicacionId }
          : {}),
      },
      order: {
        fechaCreacion: 'ASC',
      },
    });
  }
}
