import { Injectable, NotFoundException } from '@nestjs/common';
import { Publicacion } from '../entity/publicacionEntity';
import { PublicacionRepository } from '../repository/publicacionRepository';
import { CrearPublicacionDto } from '../dtos/crearPublicacionDto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { EditarPublicacionDto } from '../dtos/editarPublicacionDto';
import { rolUsuario } from 'src/usuario/enums/rolUsuario';

@Injectable()
export class PublicacionService {
  constructor(private readonly publicacionRepository: PublicacionRepository) {}

  async crearPublicacion(
    dto: CrearPublicacionDto,
    creadorId: string,
  ): Promise<Publicacion> {
    const nuevaPublicacion = this.publicacionRepository.crear({
      titulo: dto.titulo,
      descripcion: dto.descripcion,
      categoriaId: dto.categoriaId,
      localidadId: dto.localidadId,
      condicion: dto.condicion,
      imagenUrl: dto.imagenUrl,
      creadorId,
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

    publicacion.validarCreador(
      usuarioId,
      'Solo el creador puede editar la publicación',
    );

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

    publicacion.validarNoEsCreador(
      usuarioId,
      'No podés reservar tu propia publicación',
    );

    publicacion.reservar();

    return this.publicacionRepository.guardar(publicacion);
  }

  async cancelarReserva(id: string, usuarioId: string): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    publicacion.validarCreador(
      usuarioId,
      'Solo el creador puede cancelar la reserva',
    );

    publicacion.cancelarReserva();

    return this.publicacionRepository.guardar(publicacion);
  }

  async pausar(
    id: string,
    usuarioId: string,
    usuarioRol: rolUsuario,
  ): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    publicacion.validarPuedeSerGestionadaPor(
      usuarioId,
      usuarioRol,
      'Solo el creador, un moderador o un superusuario puede pausar la publicación',
    );

    publicacion.pausar();

    return this.publicacionRepository.guardar(publicacion);
  }

  async reactivar(
    id: string,
    usuarioId: string,
    usuarioRol: rolUsuario,
  ): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    publicacion.validarPuedeSerGestionadaPor(
      usuarioId,
      usuarioRol,
      'Solo el creador, un moderador o un superusuario puede reactivar la publicación',
    );

    publicacion.reactivar();

    return this.publicacionRepository.guardar(publicacion);
  }

  async eliminar(
    id: string,
    usuarioId: string,
    usuarioRol: rolUsuario,
  ): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    publicacion.validarPuedeSerGestionadaPor(
      usuarioId,
      usuarioRol,
      'Solo el creador, un moderador o superusuario puede eliminar la publicación',
    );

    publicacion.eliminar();

    return this.publicacionRepository.guardar(publicacion);
  }

  async guardar(publicacion: Publicacion): Promise<Publicacion> {
    return this.publicacionRepository.guardar(publicacion);
  }
}
