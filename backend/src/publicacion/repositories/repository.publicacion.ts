import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Publicacion } from '../entities/publicacionEntity';

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
      where: { id },
    });
  }
  listar(): Promise<Publicacion[]> {
    return this.repository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }
}
