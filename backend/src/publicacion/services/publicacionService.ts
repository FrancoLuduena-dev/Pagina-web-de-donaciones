import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Publicacion } from '../entities/publicacionEntity';
import { PublicacionRepository } from '../repositories/publicacionRepository';
import { CrearPublicacionDto } from '../DTOS/crearPublicacionDto';
import { Rol } from 'src/enum';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { EditarPublicacionDto } from '../DTOS/editarPublicacionDto';

@Injectable()
export class PublicacionService {
  constructor(private readonly publicacionRepository: PublicacionRepository) { }

  async crearPublicacion(dto: CrearPublicacionDto): Promise<Publicacion> {
    const nuevaPublicacion = this.publicacionRepository.crear({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      categoriaId: dto.categoriaId,
      localidadId: dto.localidadId,
      condicion: dto.condicion,
      imagenUrl: dto.imagenUrl,
      creadorId: '550e8400-e29b-41d4-a716-446655440003',
    });

    return this.publicacionRepository.guardar(nuevaPublicacion);
  }

  listarPublico(): Promise<Publicacion[]> {
    return this.publicacionRepository.listarPublico();
  }

  listarMisPublicaciones(
    creadorId: string,
    estado?: EstadoPublicacion,
  ): Promise<Publicacion[]> {
    return this.publicacionRepository.listarPorCreador(creadorId, estado);
  }

  async editar(
    id: string,
    dto: EditarPublicacionDto,
    usuarioId: string,
  ): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    if (publicacion.creadorId !== usuarioId) {
      throw new ForbiddenException(
        'Solo el creador puede editar la publicación',
      );
    }

    publicacion.editar(dto);

    return this.publicacionRepository.guardar(publicacion);
  }

  async buscarPublicacionPorId(id: string): Promise<Publicacion> {
    const publicacion = await this.publicacionRepository.buscarPorId(id);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return publicacion;
  }

  async reservar(id: string, usuarioId: string): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    if (publicacion.creadorId === usuarioId) {
      throw new ForbiddenException('No podés reservar tu propia publicación');
    }

    publicacion.reservar();

    return this.publicacionRepository.guardar(publicacion);
  }

  async cancelarReserva(id: string, usuarioId: string): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    if (publicacion.creadorId !== usuarioId) {
      throw new ForbiddenException('Solo el creador puede cancelar la reserva');
    }

    publicacion.cancelarReserva();

    return this.publicacionRepository.guardar(publicacion);
  }

  async pausar(
    id: string,
    usuarioId: string,
    usuarioRol: Rol,
  ): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    const esCreador = publicacion.creadorId === usuarioId;
    const esModerador = usuarioRol === Rol.MODERADOR;
    const esSuperusuario = usuarioRol === Rol.SUPERUSUARIO;

    if (!esCreador && !esModerador && !esSuperusuario) {
      throw new ForbiddenException(
        'Solo el creador, un moderador o un superusuario puede pausar la publicación',
      );
    }

    publicacion.pausar();

    return this.publicacionRepository.guardar(publicacion);
  }

  async reactivar(
    id: string,
    usuarioId: string,
    usuarioRol: Rol,
  ): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    const esCreador = publicacion.creadorId === usuarioId;
    const esModerador = usuarioRol === Rol.MODERADOR;
    const esSuperusuario = usuarioRol === Rol.SUPERUSUARIO;

    if (!esCreador && !esModerador && !esSuperusuario) {
      throw new ForbiddenException(
        'Solo el creador, un moderador o un superusuario puede reactivar la publicación',
      );
    }

    publicacion.reactivar();

    return this.publicacionRepository.guardar(publicacion);
  }

  async entregar(id: string, usuarioId: string): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    if (publicacion.creadorId !== usuarioId) {
      throw new ForbiddenException(
        'Solo el creador puede marcar la publicación como entregada',
      );
    }

    publicacion.entregar();

    return this.publicacionRepository.guardar(publicacion);
  }

  async eliminar(
    id: string,
    usuarioId: string,
    usuarioRol: Rol,
  ): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    const esCreador = publicacion.creadorId === usuarioId;
    const esModerador = usuarioRol === Rol.MODERADOR;
    const esSuperUsuario = usuarioRol === Rol.SUPERUSUARIO;

    if (!esCreador && !esModerador && !esSuperUsuario) {
      throw new ForbiddenException(
        'Solo el creador, un moderador o super usuario puede eliminar la publicación',
      );
    }

    publicacion.eliminar();

    return this.publicacionRepository.guardar(publicacion);
  }
}
