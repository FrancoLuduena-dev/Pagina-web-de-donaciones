import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Denuncia } from '../entity/denunciaEntity';
import { FiltroDenunciaDto } from '../dtos/filtroDenunciaDto';

@Injectable()
export class DenunciaRepository {
  constructor(
    @InjectRepository(Denuncia)
    private readonly repository: Repository<Denuncia>,
  ) {}

  crear(denuncia: Partial<Denuncia>): Denuncia {
    return this.repository.create(denuncia);
  }

  guardar(denuncia: Denuncia): Promise<Denuncia> {
    return this.repository.save(denuncia);
  }

  buscarPorId(id: string): Promise<Denuncia | null> {
    return this.repository.findOne({
      where: { id },
    });
  }

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
