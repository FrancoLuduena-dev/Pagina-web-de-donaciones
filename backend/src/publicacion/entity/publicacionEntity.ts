import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
  OneToMany,
} from 'typeorm';

import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { EditarPublicacionDto } from '../dtos/editarPublicacionDto';
import { TRANSICIONES_PUBLICACION } from '../constante/transicionesPublicacion';
import { Solicitud } from '../../solicitud/entity/solicitudEntity';
import { rolUsuario } from '../../usuario/enums/rolUsuario';

/**
 * Entidad que representa una publicación dentro del ciclo de vida del sistema.
 *
 * Modela el estado de una donación, sus restricciones de negocio y las
 * transiciones permitidas entre los distintos momentos de la publicación.
 */
@Entity('publicacion')
export class Publicacion {
  /**
   * Identificador único de la publicación.
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Identificador del usuario que creó la publicación.
   *
   * Se utiliza para validar propiedad sobre el recurso y aplicar reglas
   * de negocio asociadas al creador.
   */
  @Column({ type: 'uuid' })
  creadorId!: string;

  /**
   * Título visible de la publicación.
   *
   * Resume el objeto ofrecido en donación.
   */
  @Column({ length: 100 })
  titulo!: string;

  /**
   * Descripción detallada del objeto publicado.
   *
   * Permite al creador brindar información adicional sobre el estado,
   * características o condiciones de entrega del objeto.
   */
  @Column({ type: 'text' })
  descripcion!: string;

  /**
   * Identificador de la categoría asociada a la publicación.
   *
   * Permite clasificar el objeto publicado para facilitar su búsqueda
   * y organización dentro del sistema.
   */
  @Column({ type: 'uuid' })
  categoriaId!: string;

  /**
   * Identificador de la localidad asociada a la publicación.
   *
   * Permite ubicar geográficamente la donación y facilitar búsquedas
   * por zona.
   */
  @Column({ type: 'uuid' })
  localidadId!: string;

  /**
   * Condición declarada del objeto ofrecido.
   *
   * Indica el estado material del objeto, por ejemplo si es nuevo,
   * usado o requiere alguna consideración especial.
   */
  @Column({
    type: 'enum',
    enum: CondicionObjeto,
  })
  condicion!: CondicionObjeto;

  /**
   * Lista de URLs de imágenes asociadas a la publicación.
   *
   * Permite mostrar evidencia visual del objeto ofrecido en donación.
   */
  @Column({ type: 'jsonb', default: [] })
  imagenUrls!: string[];

  /**
   * Estado actual de la publicación dentro de su ciclo de vida.
   *
   * Define qué operaciones pueden realizarse sobre la publicación según
   * el momento del flujo en el que se encuentre.
   */
  @Column({
    type: 'enum',
    enum: EstadoPublicacion,
    default: EstadoPublicacion.DISPONIBLE,
  })
  estado!: EstadoPublicacion;

  /**
   * Versión administrada por TypeORM para registrar cambios sobre la entidad.
   *
   * TypeORM incrementa este valor automáticamente al persistir modificaciones
   * mediante save(). El campo permite identificar cambios sucesivos sobre una
   * publicación y sirve como base para implementar controles de concurrencia.
   */
  @VersionColumn()
  version!: number;

  /**
   * Fecha de creación de la publicación.
   *
   * Se genera automáticamente al persistir la entidad por primera vez.
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Fecha de última actualización de la publicación.
   *
   * Se actualiza automáticamente cada vez que la entidad es modificada.
   */
  @UpdateDateColumn({ nullable: true })
  updatedAt!: Date;

  /**
   * Fecha de eliminación lógica de la publicación.
   *
   * Permite dar de baja la publicación sin eliminar físicamente el registro
   * de la base de datos.
   */
  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;

  /**
   * Solicitudes asociadas a la publicación.
   *
   * Representa la relación entre la publicación y los usuarios interesados
   * en recibir la donación.
   */
  @OneToMany(() => Solicitud, (solicitud) => solicitud.publicacion)
  solicitudes!: Solicitud[];

  /**
   * Valida que el usuario sea el creador de la publicación.
   *
   * Esta regla protege la propiedad del contenido y evita que terceros modifiquen
   * o gestionen publicaciones que no les pertenecen.
   *
   * @param usuarioId Identificador del usuario a validar.
   * @param mensaje Mensaje de error que se devuelve si la validación falla.
   *
   * @throws ForbiddenException Si el usuario no es el creador.
   */
  validarCreador(
    usuarioId: string,
    mensaje = 'Solo el creador puede realizar esta acción',
  ): void {
    if (this.creadorId !== usuarioId) {
      throw new ForbiddenException(mensaje);
    }
  }

  /**
   * Valida que el usuario no sea el creador de la publicación.
   *
   * Esta regla evita que el propietario participe en acciones que deben ser
   * realizadas por otros usuarios, como reservar su propia publicación.
   *
   * @param usuarioId Identificador del usuario a validar.
   * @param mensaje Mensaje de error que se devuelve si la validación falla.
   *
   * @throws ForbiddenException Si el usuario es el creador.
   */
  validarNoEsCreador(
    usuarioId: string,
    mensaje = 'No podés realizar esta acción sobre tu propia publicación',
  ): void {
    if (this.creadorId === usuarioId) {
      throw new ForbiddenException(mensaje);
    }
  }

  /**
   * Valida si un usuario puede gestionar la publicación según su rol.
   *
   * El creador puede gestionar su publicación, mientras que moderadores o
   * administradores pueden intervenir cuando la acción corresponde a la
   * moderación del sistema.
   *
   * @param usuarioId Identificador del usuario que intenta gestionar.
   * @param usuarioRol Rol del usuario.
   * @param mensaje Mensaje de error si no tiene permisos.
   *
   * @throws ForbiddenException Si el usuario no es el creador ni cuenta con rol de moderación.
   */
  validarPuedeSerGestionadaPor(
    usuarioId: string,
    usuarioRol: rolUsuario,
    mensaje = 'No tenés permisos para gestionar esta publicación',
  ): void {
    const esCreador = this.creadorId === usuarioId;
    const esModerador = usuarioRol === rolUsuario.usuarioModerador;
    const esAdministrador = usuarioRol === rolUsuario.usuarioAdministrador;

    if (!esCreador && !esModerador && !esAdministrador) {
      throw new ForbiddenException(mensaje);
    }
  }

  /**
   * Valida que la publicación pueda recibir solicitudes.
   *
   * Solo una publicación en estado disponible debe aceptar nuevas solicitudes,
   * ya que los estados reservada, entregada o eliminada representan etapas
   * posteriores del ciclo de vida.
   */
  validarPuedeRecibirSolicitudes(): void {
    if (this.estado !== EstadoPublicacion.DISPONIBLE) {
      throw new BadRequestException(
        'La publicación no está disponible para recibir solicitudes',
      );
    }
  }

  /**
   * Indica si la publicación puede ser editada en su estado actual.
   *
   * La edición está permitida únicamente cuando la publicación sigue activa
   * o fue pausada temporalmente, pero no cuando ya fue reservada, entregada o eliminada.
   *
   * @returns Verdadero si la publicación admite edición.
   */
  puedeEditar(): boolean {
    return (
      this.estado === EstadoPublicacion.DISPONIBLE ||
      this.estado === EstadoPublicacion.PAUSADA
    );
  }

  /**
   * Edita los campos principales de la publicación si el estado lo permite.
   *
   * La actualización no cambia el ciclo de vida de la publicación, pero sí
   * sus datos descriptivos y de presentación.
   *
   * @param datos Datos parciales con los atributos a modificar.
   *
   * @throws BadRequestException Si la publicación no puede editarse en su estado actual.
   */
  editar(datos: EditarPublicacionDto): void {
    if (!this.puedeEditar()) {
      throw new BadRequestException(
        'La publicación no puede editarse en su estado actual',
      );
    }

    if (datos.titulo !== undefined) {
      this.titulo = datos.titulo;
    }

    if (datos.descripcion !== undefined) {
      this.descripcion = datos.descripcion;
    }

    if (datos.imagenUrls !== undefined) {
      this.imagenUrls = datos.imagenUrls;
    }

    if (datos.condicion !== undefined) {
      this.condicion = datos.condicion;
    }

    if (datos.categoriaId !== undefined) {
      this.categoriaId = datos.categoriaId;
    }

    if (datos.localidadId !== undefined) {
      this.localidadId = datos.localidadId;
    }

    this.updatedAt = new Date();
  }

  /**
   * Reserva la publicación para avanzar en su ciclo de negocio.
   *
   * Esta operación representa que la publicación quedó comprometida con una
   * solicitud aceptada y ya no debería seguir disponible para nuevos pedidos.
   */
  reservar(): void {
    this.transicionarA(EstadoPublicacion.RESERVADA);
  }

  /**
   * Pausa la publicación para desactivarla temporalmente.
   *
   * La pausa es una forma de detener la operatividad de la publicación sin
   * darla de baja definitivamente.
   */
  pausar(): void {
    this.transicionarA(EstadoPublicacion.PAUSADA);
  }

  /**
   * Reactiva una publicación previamente pausada.
   *
   * Esta operación devuelve la publicación a un estado activo cuando aún no
   * se ha dado de baja ni completado su ciclo de vida.
   */
  reactivar(): void {
    if (this.estado !== EstadoPublicacion.PAUSADA) {
      throw new BadRequestException(
        'Solo se puede reactivar una publicación pausada',
      );
    }

    this.transicionarA(EstadoPublicacion.DISPONIBLE);
  }

  /**
   * Marca la publicación como entregada.
   *
   * Esta transición representa que la donación se concretó y que la
   * publicación ya no debe seguir operando como disponible.
   */
  entregar(): void {
    this.transicionarA(EstadoPublicacion.ENTREGADA);
  }

  /**
   * Da de baja la publicación de forma lógica.
   *
   * La eliminación marca el fin del ciclo operativo de la publicación y evita
   * que siga participando de acciones activas del sistema.
   */
  eliminar(): void {
    this.transicionarA(EstadoPublicacion.ELIMINADA);
    this.deletedAt = new Date();
  }

  /**
   * Elimina una publicación por decisión de moderación.
   *
   * Si la publicación estaba reservada, se la marca directamente como
   * eliminada; en otros casos, se aplica la eliminación estándar.
   */
  eliminarPorModeracion(): void {
    if (this.estado === EstadoPublicacion.RESERVADA) {
      this.estado = EstadoPublicacion.ELIMINADA;
      this.deletedAt = new Date();
      return;
    }

    this.eliminar();
  }
  /**
   * Cancela la reserva de una publicación.
   *
   * Esta operación permite devolver una publicación reservada a un estado
   * disponible cuando se revierte el compromiso previo.
   */
  cancelarReserva(): void {
    if (this.estado !== EstadoPublicacion.RESERVADA) {
      throw new BadRequestException(
        'Solo se puede cancelar la reserva de una publicación reservada',
      );
    }

    this.transicionarA(EstadoPublicacion.DISPONIBLE);
  }

  /**
   * Cambia el estado de la publicación si la transición está permitida.
   *
   * El estado representa una etapa del ciclo de vida de la publicación y el
   * sistema evita transiciones inválidas para mantener coherencia funcional.
   *
   * @param nuevoEstado Estado destino de la publicación.
   *
   * @throws BadRequestException Si la transición no está permitida.
   */
  private transicionarA(nuevoEstado: EstadoPublicacion): void {
    const permitidos = TRANSICIONES_PUBLICACION[this.estado];

    if (!permitidos.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede pasar de ${this.estado} a ${nuevoEstado}`,
      );
    }

    this.estado = nuevoEstado;
  }
}
