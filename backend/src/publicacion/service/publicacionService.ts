import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Publicacion } from '../entity/publicacionEntity';
import { PublicacionRepository } from '../repository/publicacionRepository';
import { CrearPublicacionDto } from '../dtos/crearPublicacionDto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { EditarPublicacionDto } from '../dtos/editarPublicacionDto';
import { rolUsuario } from 'src/usuario/enums/rolUsuario';
import { FiltrosPublicacionDto } from '../dtos/filtrosPublicacionDto';
import UsuarioService from 'src/usuario/service/usuarioService';

export type PublicacionConCreador = Publicacion & {
  creadorNombreUsuario: string;
  creadorNombreCompleto: string;
};

@Injectable()
export class PublicacionService {
  constructor(
    private readonly publicacionRepository: PublicacionRepository,
    private readonly usuarioService: UsuarioService,
  ) {}

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
      imagenUrls: dto.imagenUrls,
      creadorId,
    });

    return this.publicacionRepository.guardar(nuevaPublicacion);
  }

  listarPublico(filtros: FiltrosPublicacionDto): Promise<Publicacion[]> {
    return this.publicacionRepository.listarPublico(filtros);
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

  async buscarPublicacionPorIdConCreador(
    id: string,
  ): Promise<PublicacionConCreador> {
    const publicacion = await this.buscarPublicacionPorId(id);
    const creador = await this.usuarioService.obtenerUsuarioPorId(
      publicacion.creadorId,
    );

    return Object.assign(publicacion, {
      creadorNombreUsuario: creador.nombreUsuario,
      creadorNombreCompleto: creador.nombreCompleto,
    });
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
    usuarioRol: rolUsuario,
  ): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    const esCreador = publicacion.creadorId === usuarioId;
    const esModerador = usuarioRol === rolUsuario.usuarioModerador;
    const esAdministrador = usuarioRol === rolUsuario.usuarioAdministrador;

    if (!esCreador && !esModerador && !esAdministrador) {
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
    usuarioRol: rolUsuario,
  ): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    const esCreador = publicacion.creadorId === usuarioId;
    const esModerador = usuarioRol === rolUsuario.usuarioModerador;
    const esAdministrador = usuarioRol === rolUsuario.usuarioAdministrador;

    if (!esCreador && !esModerador && !esAdministrador) {
      throw new ForbiddenException(
        'Solo el creador, un moderador o un superusuario puede reactivar la publicación',
      );
    }

    publicacion.reactivar();

    return this.publicacionRepository.guardar(publicacion);
  }

  async eliminar(id: string, usuarioId: string): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    if (publicacion.creadorId !== usuarioId) {
      throw new ForbiddenException(
        'Solo el creador puede eliminar la publicación',
      );
    }

    publicacion.eliminar();

    return this.publicacionRepository.guardar(publicacion);
  }

  async guardar(publicacion: Publicacion): Promise<Publicacion> {
    return this.publicacionRepository.guardar(publicacion);
  }
}
