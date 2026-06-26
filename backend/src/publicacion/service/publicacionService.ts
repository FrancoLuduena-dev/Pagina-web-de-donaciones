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

/**
 * Servicio encargado de gestionar el ciclo de vida de las publicaciones.
 *
 * Coordina las operaciones de creación, edición, reserva, pausa, reactivación,
 * eliminación y consulta, aplicando las reglas de negocio del dominio.
 */
@Injectable()
export class PublicacionService {
  constructor(
    private readonly publicacionRepository: PublicacionRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly usuarioService: UsuarioService,
  ) {}

  /**
   * Crea una nueva publicación a partir de los datos recibidos.
   *
   * Esta operación representa el inicio del ciclo de vida de una publicación,
   * asignando al usuario autenticado el rol de creador y registrando la
   * publicación en un estado inicial disponible para interacciones posteriores.
   *
   * @param dto Datos de la publicación que se desea crear.
   * @param creadorId Identificador del usuario que crea la publicación.
   * @returns Publicación persistida.
   */
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

  /**
   * Devuelve el listado público de publicaciones aplicando filtros.
   *
   * Esta consulta está orientada a la vista general del sistema y expone solo
   * aquellas publicaciones que cumplen con las reglas de visibilidad del módulo.
   *
   * @param filtros Filtros de búsqueda para la lista pública.
   * @returns Publicaciones visibles para el público.
   */
  listarPublico(filtros: FiltrosPublicacionDto): Promise<Publicacion[]> {
    return this.publicacionRepository.listarPublico(filtros);
  }

  /**
   * Lista las publicaciones pertenecientes a un usuario determinado.
   *
   * Permite consultar el estado de las publicaciones propias, lo que resulta
   * útil para que el creador supervise su ciclo de vida y su disponibilidad.
   *
   * @param creadorId Identificador del usuario creador.
   * @param estado Estado opcional para filtrar las publicaciones.
   * @returns Publicaciones del creador que coinciden con el filtro.
   */
  listarMisPublicaciones(
    creadorId: string,
    estado?: EstadoPublicacion,
  ): Promise<Publicacion[]> {
    return this.publicacionRepository.listarPorCreador(creadorId, estado);
  }

  /**
   * Edita una publicación si el usuario autenticado es su creador.
   *
   * La edición está restringida para preservar la propiedad de la publicación
   * y evitar que terceros alteren datos que no les corresponden.
   *
   * @param id Identificador de la publicación a editar.
   * @param dto Datos parciales con los campos a modificar.
   * @param usuarioId Identificador del usuario que intenta editar.
   * @returns Publicación actualizada.
   *
   * @throws NotFoundException Si la publicación no existe.
   * @throws ForbiddenException Si el usuario no es el creador.
   * @throws BadRequestException Si el estado actual no permite editar.
   */
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

  /**
   * Busca una publicación por su identificador.
   *
   * Se utiliza como punto de entrada para operaciones que requieren recuperar
   * una publicación existente antes de aplicar reglas de negocio.
   *
   * @param id Identificador de la publicación.
   * @returns Publicación encontrada.
   *
   * @throws NotFoundException Si no existe una publicación con ese identificador.
   */
  async buscarPublicacionPorId(id: string): Promise<Publicacion> {
    const publicacion = await this.publicacionRepository.buscarPorId(id);

    if (!publicacion) {
      throw new NotFoundException('Publicación no encontrada');
    }

    return publicacion;
  }

  /**
   * Busca una publicación junto con los datos del creador.
   *
   * Esta operación amplía la información básica de la publicación para que la
   * capa de presentación pueda mostrar el contexto del usuario creador.
   *
   * @param id Identificador de la publicación.
   * @returns Publicación con datos del creador.
   *
   * @throws NotFoundException Si la publicación no existe.
   */
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

  /**
   * Reserva una publicación disponible para un usuario distinto del creador.
   *
   * La reserva representa el compromiso de una publicación con una solicitud
   * aceptada, por lo que solo debe permitirse cuando la publicación está en
   * estado disponible y el solicitante no es el creador.
   *
   * @param id Identificador de la publicación.
   * @param usuarioId Identificador del usuario que intenta reservarla.
   * @returns Publicación actualizada con el nuevo estado.
   *
   * @throws NotFoundException Si la publicación no existe.
   * @throws ForbiddenException Si el usuario es el creador.
   * @throws BadRequestException Si la publicación no puede reservarse en su estado actual.
   */
  async reservar(id: string, usuarioId: string): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    publicacion.validarNoEsCreador(
      usuarioId,
      'No podés reservar tu propia publicación',
    );

    publicacion.reservar();

    return this.publicacionRepository.guardar(publicacion);
  }

  /**
   * Cancela la reserva de una publicación cuando la realiza su creador.
   *
   * Esta acción permite revertir el compromiso de una publicación reservada
   * y devolverla a un estado disponible para nuevas operaciones.
   *
   * @param id Identificador de la publicación.
   * @param usuarioId Identificador del usuario que intenta cancelar la reserva.
   * @returns Publicación actualizada.
   *
   * @throws NotFoundException Si la publicación no existe.
   * @throws ForbiddenException Si el usuario no es el creador.
   * @throws BadRequestException Si la publicación no está reservada.
   */
  async cancelarReserva(id: string, usuarioId: string): Promise<Publicacion> {
    const publicacion = await this.buscarPublicacionPorId(id);

    publicacion.validarCreador(
      usuarioId,
      'Solo el creador puede cancelar la reserva',
    );

    publicacion.cancelarReserva();

    return this.publicacionRepository.guardar(publicacion);
  }

  /**
   * Pausa una publicación cuando el usuario tiene permisos para gestionarla.
   *
   * La pausa es una forma de desactivar temporalmente la publicación sin
   * eliminarla, lo que evita que siga operando como activa mientras se
   * evalúa o se corrige su situación.
   *
   * @param id Identificador de la publicación.
   * @param usuarioId Identificador del usuario que realiza la acción.
   * @param usuarioRol Rol del usuario que intenta pausar la publicación.
   * @returns Publicación actualizada.
   *
   * @throws NotFoundException Si la publicación no existe.
   * @throws ForbiddenException Si el usuario no tiene permisos para gestionarla.
   * @throws BadRequestException Si el estado actual no permite la pausa.
   */
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

  /**
   * Reactiva una publicación previamente pausada.
   *
   * La reactivación devuelve la publicación a un estado operativo, siempre
   * que el usuario tenga permisos y la publicación se encuentre pausada.
   *
   * @param id Identificador de la publicación.
   * @param usuarioId Identificador del usuario que realiza la acción.
   * @param usuarioRol Rol del usuario que intenta reactivarla.
   * @returns Publicación actualizada.
   *
   * @throws NotFoundException Si la publicación no existe.
   * @throws ForbiddenException Si el usuario no tiene permisos para gestionarla.
   * @throws BadRequestException Si la publicación no está pausada.
   */
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

  /**
   * Elimina una publicación de forma lógica o por moderación.
   *
   * La eliminación marca la publicación como dada de baja y, cuando la acción
   * es realizada por moderación, también deja constancia de que la decisión
   * fue tomada por un actor distinto al creador.
   *
   * @param id Identificador de la publicación.
   * @param usuarioId Identificador del usuario que realiza la acción.
   * @param usuarioRol Rol del usuario que intenta eliminar la publicación.
   * @returns Publicación actualizada.
   *
   * @throws NotFoundException Si la publicación no existe.
   * @throws ForbiddenException Si el usuario no tiene permisos para gestionarla.
   * @throws BadRequestException Si el estado actual no permite la eliminación.
   */
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

  /**
   * Persiste los cambios de una publicación ya modificada.
   *
   * Este método centraliza el guardado para que las operaciones del servicio
   * puedan reutilizar la misma lógica de persistencia.
   *
   * @param publicacion Publicación modificada que debe persistirse.
   * @returns Publicación guardada.
   */
  async guardar(publicacion: Publicacion): Promise<Publicacion> {
    return this.publicacionRepository.guardar(publicacion);
  }
}
