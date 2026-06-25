import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { MotivoDenuncia } from '../enums/motivoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';
import { puedeTransicionarDenuncia } from '../constante/transicionesDenuncia';

/**
 * Entidad que representa una denuncia realizada sobre una publicación.
 *
 * Guarda los datos principales del reclamo, el usuario que denuncia,
 * la publicación denunciada, el creador de esa publicación y el estado actual
 * del proceso de moderación.
 */
@Entity('denuncias')
export class Denuncia {
  /**
   * Identificador único de la denuncia.
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Identificador de la publicación denunciada.
   */
  @Column({ type: 'uuid' })
  publicacionId!: string;

  /**
   * Identificador del usuario que realizó la denuncia.
   */
  @Column({ type: 'uuid' })
  denuncianteId!: string;

  /**
   * Identificador del usuario creador de la publicación denunciada.
   */
  @Column({ type: 'uuid' })
  creadorPublicacionId!: string;

  /**
   * Motivo seleccionado para justificar la denuncia.
   */
  @Column({
    type: 'enum',
    enum: MotivoDenuncia,
  })
  motivo!: MotivoDenuncia;

  /**
   * Comentario opcional agregado por el usuario denunciante.
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  comentario?: string | null;

  /**
   * Estado actual de la denuncia dentro del flujo de moderación.
   */
  @Column({
    type: 'enum',
    enum: EstadoDenuncia,
    default: EstadoDenuncia.PENDIENTE,
  })
  estado!: EstadoDenuncia;

  /**
   * Identificador del moderador asignado a revisar la denuncia.
   */
  @Column({ type: 'uuid', nullable: true })
  moderadorAsignadoId?: string | null;

  /**
   * Tipo de resolución aplicada por el moderador.
   */
  @Column({
    type: 'enum',
    enum: TipoResolucion,
    nullable: true,
  })
  tipoResolucion?: TipoResolucion | null;

  /**
   * Detalle ingresado por el moderador al resolver la denuncia.
   */
  @Column({ type: 'varchar', length: 500, nullable: true })
  detalleResolucion?: string | null;

  /**
   * Fecha en la que la denuncia fue resuelta.
   */
  @Column({ type: 'timestamp', nullable: true })
  fechaResolucion?: Date | null;

  /**
   * Versión de la denuncia utilizada para validar actualizaciones.
   */
  @Column({ type: 'int', default: 1 })
  version!: number;

  /**
   * Fecha de creación de la denuncia.
   */
  @CreateDateColumn()
  fechaCreacion!: Date;

  /**
   * Fecha de última actualización de la denuncia.
   */
  @UpdateDateColumn()
  fechaActualizacion!: Date;

  /**
   * Valida que el usuario informado no sea el creador de la publicación denunciada.
   *
   * Esta regla impide que un usuario reporte su propia publicación y evita
   * abusos del proceso de denuncias.
   *
   * @param usuarioId Identificador del usuario a validar.
   * @param mensaje Mensaje de error a devolver si la validación falla.
   *
   * @throws ForbiddenException Cuando el usuario es el creador de la publicación.
   */
  validarNoEsCreadorPublicacion(
    usuarioId: string,
    mensaje = 'No podés denunciar tu propia publicación',
  ): void {
    if (this.creadorPublicacionId === usuarioId) {
      throw new ForbiddenException(mensaje);
    }
  }
  /**
   * Valida que el moderador informado sea el moderador asignado a la denuncia.
   *
   * @param moderadorId Identificador del moderador a validar.
   * @param mensaje Mensaje de error a devolver si la validación falla.
   *
   * @throws ForbiddenException Cuando el moderador no coincide con el asignado.
   */
  validarModeradorAsignado(
    moderadorId: string,
    mensaje = 'Solo el moderador asignado puede realizar esta acción',
  ): void {
    if (this.moderadorAsignadoId !== moderadorId) {
      throw new ForbiddenException(mensaje);
    }
  }
  /**
   * Valida que la denuncia pueda ser resuelta por el moderador informado.
   *
   * Para resolver un reporte, la denuncia debe encontrarse en revisión y
   * solo el moderador asignado al caso tiene autoridad para cerrarlo.
   *
   * @param moderadorId Identificador del moderador que intenta resolver.
   *
   * @throws BadRequestException Cuando la denuncia no está en revisión.
   * @throws ForbiddenException Cuando el moderador no es el asignado.
   */
  validarPuedeResolver(moderadorId: string): void {
    if (this.estado !== EstadoDenuncia.EN_REVISION) {
      throw new BadRequestException('DENUNCIA_DEBE_ESTAR_EN_REVISION');
    }

    this.validarModeradorAsignado(
      moderadorId,
      'SOLO_MODERADOR_ASIGNADO_PUEDE_RESOLVER',
    );
  }
  /**
   * Asigna la denuncia a un moderador y la mueve al estado de revisión.
   *
   * Esta operación representa el inicio del análisis del caso por parte del
   * equipo de moderación.
   *
   * @param moderadorId Identificador del moderador que toma la denuncia.
   */
  tomar(moderadorId: string): void {
    this.cambiarEstado(EstadoDenuncia.EN_REVISION);

    this.moderadorAsignadoId = moderadorId;
    this.version += 1;
  }
  /**
   * Resuelve la denuncia con el tipo y detalle de resolución indicados.
   *
   * La operación actualiza el estado del reporte, registra la decisión de
   * moderación y deja constancia de cuándo se cerró el caso.
   *
   * @param moderadorId Identificador del moderador que resuelve la denuncia.
   * @param tipoResolucion Tipo de resolución aplicada.
   * @param detalleResolucion Detalle informado por el moderador.
   */
  resolver(
    moderadorId: string,
    tipoResolucion: TipoResolucion,
    detalleResolucion: string,
  ): void {
    this.validarPuedeResolver(moderadorId);
    this.cambiarEstado(EstadoDenuncia.RESUELTA);

    this.tipoResolucion = tipoResolucion;
    this.detalleResolucion = detalleResolucion;
    this.fechaResolucion = new Date();
    this.version += 1;
  }

  /**
   * Cambia el estado de la denuncia si la transición está permitida.
   *
   * @param nuevoEstado Estado al que se desea pasar la denuncia.
   *
   * @throws BadRequestException Cuando la transición entre estados no está permitida.
   */

  private cambiarEstado(nuevoEstado: EstadoDenuncia): void {
    if (!puedeTransicionarDenuncia(this.estado, nuevoEstado)) {
      throw new BadRequestException(
        `No se puede cambiar una denuncia de ${this.estado} a ${nuevoEstado}`,
      );
    }

    this.estado = nuevoEstado;
  }
}
