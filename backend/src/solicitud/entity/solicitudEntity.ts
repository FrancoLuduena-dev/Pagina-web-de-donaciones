import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

import { Publicacion } from '../../publicacion/entity/publicacionEntity';
import Usuario from '../../usuario/entity/usuarioEntity';
import { TRANSICIONES_SOLICITUD } from '../constante/transicionesSolicitud';
import { EstadoSolicitud } from '../enums/estadoSolicitud';

/**
 * Entidad que representa una solicitud de interés sobre una publicación.
 *
 * Su estado refleja el avance del proceso entre el solicitante y el creador,
 * mientras que las transiciones están restringidas por reglas de negocio.
 */
@Entity('solicitudes')
export class Solicitud {
  /**
   * Identificador único de la solicitud.
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Identificador de la publicación sobre la que se realiza la solicitud.
   *
   * Permite vincular el interés del usuario con la publicación ofrecida
   * dentro del sistema.
   */
  @Column({ type: 'uuid' })
  publicacionId!: string;

  /**
   * Publicación asociada a la solicitud.
   *
   * Representa la relación con la entidad Publicacion y permite acceder
   * a los datos de la donación solicitada cuando el flujo lo requiere.
   */
  @ManyToOne(() => Publicacion, (publicacion) => publicacion.solicitudes)
  @JoinColumn({ name: 'publicacionId' })
  publicacion!: Publicacion;

  /**
   * Identificador del usuario que realiza la solicitud.
   *
   * Se utiliza para validar quién inició el pedido y aplicar reglas de negocio
   * asociadas al solicitante.
   */
  @Column({ type: 'uuid' })
  solicitanteId!: string;

  /**
   * Usuario que realizó la solicitud.
   *
   * Representa la relación con el solicitante interesado en recibir la donación.
   */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'solicitanteId' })
  solicitante!: Usuario;

  /**
   * Identificador del usuario creador de la publicación.
   *
   * Se utiliza para validar quién puede aceptar o rechazar la solicitud,
   * ya que esas acciones corresponden al dueño de la publicación.
   */
  @Column({ type: 'uuid' })
  creadorPublicacionId!: string;

  /**
   * Usuario creador de la publicación solicitada.
   *
   * Representa la relación con el propietario de la publicación, quien puede
   * gestionar las decisiones principales sobre la solicitud recibida.
   */
  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'creadorPublicacionId' })
  creadorPublicacion!: Usuario;

  /**
   * Mensaje opcional ingresado por el solicitante.
   *
   * Permite acompañar la solicitud con información adicional para el creador
   * de la publicación.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  mensaje?: string | null;

  /**
   * Estado actual de la solicitud dentro del flujo de negocio.
   *
   * Define qué operaciones pueden realizarse sobre la solicitud, como aceptar,
   * rechazar, cancelar, finalizar o expirar, según las transiciones permitidas.
   */
  @Column({
    type: 'enum',
    enum: EstadoSolicitud,
    default: EstadoSolicitud.PENDIENTE,
  })
  estado!: EstadoSolicitud;

  /**
   * Motivo informado cuando una solicitud es rechazada.
   *
   * Permite dejar registro de la razón por la cual el creador de la publicación
   * decidió no avanzar con la solicitud.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  motivoRechazo?: string | null;

  /**
   * Motivo informado cuando una solicitud es cancelada.
   *
   * Permite registrar la causa por la cual se interrumpe una solicitud antes
   * de completar el flujo de entrega.
   */
  @Column({ type: 'varchar', length: 255, nullable: true })
  motivoCancelacion?: string | null;

  /**
   * Versión administrada por TypeORM para registrar cambios sobre la solicitud.
   *
   * TypeORM incrementa este valor automáticamente al persistir modificaciones
   * mediante save(). El campo permite identificar cambios sucesivos sobre una
   * solicitud y sirve como base para implementar controles de concurrencia.
   */
  @VersionColumn()
  version!: number;

  /**
   * Fecha de creación de la solicitud.
   *
   * Se genera automáticamente al persistir la entidad por primera vez.
   */
  @CreateDateColumn()
  createdAt!: Date;

  /**
   * Fecha de última actualización de la solicitud.
   *
   * Se actualiza automáticamente cada vez que la entidad es modificada.
   */
  @UpdateDateColumn()
  updatedAt!: Date;

  /**
   * Valida que la acción sea ejecutada por el creador de la publicación.
   *
   * Esta regla protege decisiones sensibles del flujo, como aceptar, rechazar
   * o finalizar una solicitud, porque solo el propietario de la publicación
   * puede decidir cómo avanza el proceso.
   *
   * @param usuarioId Identificador del usuario que intenta ejecutar la acción.
   * @param mensaje Mensaje alternativo para el caso de no tener permiso.
   * @throws ForbiddenException Cuando el usuario no es el creador de la publicación.
   */
  validarCreadorPublicacion(
    usuarioId: string,
    mensaje = 'Solo el creador de la publicación puede realizar esta acción',
  ): void {
    if (this.creadorPublicacionId !== usuarioId) {
      throw new ForbiddenException(mensaje);
    }
  }

  /**
   * Valida que la acción sea realizada por el usuario que originó la solicitud.
   *
   * Esta comprobación evita que un tercero modifique el estado de una solicitud
   * iniciada por otra persona.
   *
   * @param usuarioId Identificador del usuario que intenta operar.
   * @param mensaje Mensaje alternativo para el caso de no tener permiso.
   * @throws ForbiddenException Cuando el usuario no es el solicitante de la solicitud.
   */
  validarSolicitante(
    usuarioId: string,
    mensaje = 'Solo el solicitante puede realizar esta acción',
  ): void {
    if (this.solicitanteId !== usuarioId) {
      throw new ForbiddenException(mensaje);
    }
  }

  /**
   * Valida si un usuario puede cancelar la solicitud según su estado.
   *
   * El criterio depende del momento del flujo: un solicitante puede cancelar
   * una solicitud pendiente, mientras que el creador puede cancelar una que
   * ya fue aceptada para liberar la publicación.
   *
   * @param usuarioId Identificador del usuario que intenta cancelar la solicitud.
   * @throws ConflictException Cuando el estado actual no permite la cancelación.
   * @throws ForbiddenException Cuando el usuario no corresponde al rol permitido.
   */
  validarPuedeCancelarsePor(usuarioId: string): void {
    const esSolicitante = this.solicitanteId === usuarioId;
    const esCreador = this.creadorPublicacionId === usuarioId;

    if (
      this.estado !== EstadoSolicitud.PENDIENTE &&
      this.estado !== EstadoSolicitud.ACEPTADA
    ) {
      throw new ConflictException(
        'Solo se pueden cancelar solicitudes pendientes o aceptadas',
      );
    }

    if (this.estado === EstadoSolicitud.PENDIENTE && !esSolicitante) {
      throw new ForbiddenException(
        'Solo el solicitante puede cancelar una solicitud pendiente',
      );
    }

    if (this.estado === EstadoSolicitud.ACEPTADA && !esCreador) {
      throw new ForbiddenException(
        'Solo el creador puede cancelar una solicitud aceptada',
      );
    }
  }

  /**
   * Marca la solicitud como aceptada.
   *
   * En el flujo de negocio, aceptar una solicitud compromete la publicación con
   * un usuario y por eso suele ir acompañado de la reserva de la publicación.
   */
  aceptar(): void {
    this.transicionarA(EstadoSolicitud.ACEPTADA);
  }

  /**
   * Marca la solicitud como rechazada.
   *
   * Esta transición representa la decisión del creador de no avanzar con la
   * solicitud y deja cerrada esa instancia para el proceso de negociación.
   *
   * @param motivo Motivo opcional del rechazo.
   */
  rechazar(motivo?: string): void {
    if (this.estado !== EstadoSolicitud.PENDIENTE) {
      throw new ConflictException(
        'Solo se pueden rechazar solicitudes pendientes',
      );
    }

    this.transicionarA(EstadoSolicitud.RECHAZADA);
    this.motivoRechazo = motivo?.trim() || null;
  }

  /**
   * Cancela una solicitud pendiente.
   *
   * Esta operación representa que el solicitante retiró su interés antes de
   * que la solicitud avance a un estado más comprometido.
   *
   * @param motivo Motivo opcional de la cancelación.
   */
  cancelar(motivo?: string): void {
    if (this.estado !== EstadoSolicitud.PENDIENTE) {
      throw new ConflictException(
        'Solo se pueden cancelar solicitudes pendientes',
      );
    }

    this.transicionarA(EstadoSolicitud.CANCELADA);
    this.motivoCancelacion = motivo?.trim() || null;
  }

  /**
   * Cancela una solicitud ya aceptada.
   *
   * Esta transición se utiliza cuando la publicación deja de estar comprometida
   * con el solicitante y se libera la reserva asociada.
   *
   * @param motivo Motivo opcional del cierre de la solicitud aceptada.
   */
  cancelarAceptada(motivo?: string): void {
    if (this.estado !== EstadoSolicitud.ACEPTADA) {
      throw new ConflictException(
        'Solo se puede cancelar una solicitud aceptada',
      );
    }

    this.transicionarA(EstadoSolicitud.CANCELADA);
    this.motivoCancelacion = motivo?.trim() || null;
  }

  /**
   * Finaliza una solicitud aceptada.
   *
   * Esta transición marca que el proceso de entrega o intercambio ya concluyó.
   */
  finalizar(): void {
    this.transicionarA(EstadoSolicitud.FINALIZADA);
  }

  /**
   * Marca la solicitud como expirada.
   *
   * Se usa cuando el proceso ya no sigue adelante por tiempo o condiciones del
   * flujo, sin que la solicitud haya sido aceptada o rechazada.
   */
  expirar(): void {
    this.transicionarA(EstadoSolicitud.EXPIRADA);
  }

  /**
   * Aplica una transición de estado cuando la misma está permitida.
   *
   * La validación se realiza contra la máquina de estados definida para evitar
   * cambios inconsistentes entre estados y mantener el flujo del negocio coherente.
   *
   * @param nuevoEstado Estado al que se desea mover la solicitud.
   * @throws BadRequestException Cuando la transición no está permitida.
   */
  private transicionarA(nuevoEstado: EstadoSolicitud): void {
    const transicionesPermitidas = TRANSICIONES_SOLICITUD[this.estado];

    if (!transicionesPermitidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede cambiar una solicitud de ${this.estado} a ${nuevoEstado}`,
      );
    }

    this.estado = nuevoEstado;
  }
}
