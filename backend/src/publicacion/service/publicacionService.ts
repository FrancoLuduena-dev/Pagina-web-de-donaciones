import { Injectable, NotFoundException } from '@nestjs/common';
import { Publicacion } from '../entity/publicacionEntity';
import { PublicacionRepository } from '../repository/publicacionRepository';
import { CrearPublicacionDto } from '../dtos/crearPublicacionDto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { EditarPublicacionDto } from '../dtos/editarPublicacionDto';
import { rolUsuario } from 'src/usuario/enums/rolUsuario';
import { FiltrosPublicacionDto } from '../dtos/filtrosPublicacionDto';
import { PublicacionModeradaEvento } from '../evento/publicacionModeradaEvento';
import { PublicacionEliminadaEvento } from '../evento/publicacionEliminadaEvento';
import { EventoDominio } from 'src/compartidos/evento/eventoDominio';
import { EventEmitter2 } from '@nestjs/event-emitter';
import UsuarioService from 'src/usuario/service/usuarioService';

export type PublicacionConCreador = Publicacion & {
  creadorNombreUsuario: string;
  creadorNombreCompleto: string;
};

@Injectable()
export class PublicacionService {
  constructor(
    private readonly publicacionRepository: PublicacionRepository,
    private readonly eventEmitter: EventEmitter2,
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

    const publicacionGuardada =
      await this.publicacionRepository.guardar(publicacion);

    if (publicacion.creadorId !== usuarioId) {
      this.eventEmitter.emit(
        EventoDominio.PUBLICACION_PAUSADA_MODERACION,
        new PublicacionModeradaEvento(
          publicacionGuardada.id,
          publicacionGuardada.creadorId,
          publicacionGuardada.titulo,
        ),
      );
    }

    return publicacionGuardada;
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

    const publicacionGuardada =
      await this.publicacionRepository.guardar(publicacion);

    if (publicacion.creadorId !== usuarioId) {
      this.eventEmitter.emit(
        EventoDominio.PUBLICACION_REACTIVADA_MODERACION,
        new PublicacionModeradaEvento(
          publicacionGuardada.id,
          publicacionGuardada.creadorId,
          publicacionGuardada.titulo,
        ),
      );
    }

    return publicacionGuardada;
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

    const eliminadaPorModeracion = publicacion.creadorId !== usuarioId;

    if (eliminadaPorModeracion) {
      publicacion.eliminarPorModeracion();
    } else {
      publicacion.eliminar();
    }

    const publicacionGuardada =
      await this.publicacionRepository.guardar(publicacion);

    this.eventEmitter.emit(
      EventoDominio.PUBLICACION_ELIMINADA,
      new PublicacionEliminadaEvento(
        publicacionGuardada.id,
        publicacionGuardada.titulo,
        eliminadaPorModeracion,
      ),
    );
    if (eliminadaPorModeracion) {
      await this.usuarioService.registrarPublicacionEliminadaPorModeracion(
        publicacionGuardada.creadorId,
        usuarioId,
      );

      this.eventEmitter.emit(
        EventoDominio.PUBLICACION_ELIMINADA_MODERACION,
        new PublicacionModeradaEvento(
          publicacionGuardada.id,
          publicacionGuardada.creadorId,
          publicacionGuardada.titulo,
        ),
      );
    }

    return publicacionGuardada;
  }

  async guardar(publicacion: Publicacion): Promise<Publicacion> {
    return this.publicacionRepository.guardar(publicacion);
  }
}
