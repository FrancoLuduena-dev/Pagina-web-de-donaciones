import { Injectable, NotFoundException } from '@nestjs/common';
import { Publicacion } from '../entities/publicacionEntity';
import { PublicacionRepository } from '../repositories/repository.publicacion';
import { CrearPublicacionDto } from '../DTOS/crearPublicacionDto';

@Injectable()
export class PublicacionService {
  constructor(private readonly publicacionRepository: PublicacionRepository) {}

  async crearPublicacion(dto: CrearPublicacionDto): Promise<Publicacion> {
    const nuevaPublicacion = this.publicacionRepository.crear({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      categoriaId: dto.categoriaId,
      localidadId: dto.localidadId,
      condicion: dto.condicion,
      imagenUrl: dto.imagenUrl,
      creadorId: '550e8400-e29b-41d4-a716-446655440002',
    });

    return this.publicacionRepository.guardar(nuevaPublicacion);
  }

  listarPublicaciones(): Promise<Publicacion[]> {
    return this.publicacionRepository.listar();
  }

  async buscarPublicacionPorId(id: string): Promise<Publicacion> {
    const publicacion = await this.publicacionRepository.buscarPorId(id);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return publicacion;
  }
}
