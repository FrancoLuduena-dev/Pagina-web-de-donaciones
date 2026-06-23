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

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  publicacionId!: string;

  @ManyToOne(() => Publicacion, (publicacion) => publicacion.solicitudes)
  @JoinColumn({ name: 'publicacionId' })
  publicacion!: Publicacion;

  @Column({ type: 'uuid' })
  solicitanteId!: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'solicitanteId' })
  solicitante!: Usuario;

  @Column({ type: 'uuid' })
  creadorPublicacionId!: string;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'creadorPublicacionId' })
  creadorPublicacion!: Usuario;

  @Column({ type: 'varchar', length: 255, nullable: true })
  mensaje?: string | null;

  @Column({
    type: 'enum',
    enum: EstadoSolicitud,
    default: EstadoSolicitud.PENDIENTE,
  })
  estado!: EstadoSolicitud;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motivoRechazo?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  motivoCancelacion?: string | null;

  @VersionColumn()
  version!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  validarCreadorPublicacion(
    usuarioId: string,
    mensaje = 'Solo el creador de la publicación puede realizar esta acción',
  ): void {
    if (this.creadorPublicacionId !== usuarioId) {
      throw new ForbiddenException(mensaje);
    }
  }

  validarSolicitante(
    usuarioId: string,
    mensaje = 'Solo el solicitante puede realizar esta acción',
  ): void {
    if (this.solicitanteId !== usuarioId) {
      throw new ForbiddenException(mensaje);
    }
  }

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

  aceptar(): void {
    this.transicionarA(EstadoSolicitud.ACEPTADA);
  }

  rechazar(motivo?: string): void {
    if (this.estado !== EstadoSolicitud.PENDIENTE) {
      throw new ConflictException(
        'Solo se pueden rechazar solicitudes pendientes',
      );
    }

    this.transicionarA(EstadoSolicitud.RECHAZADA);
    this.motivoRechazo = motivo?.trim() || null;
  }

  cancelar(motivo?: string): void {
    if (this.estado !== EstadoSolicitud.PENDIENTE) {
      throw new ConflictException(
        'Solo se pueden cancelar solicitudes pendientes',
      );
    }

    this.transicionarA(EstadoSolicitud.CANCELADA);
    this.motivoCancelacion = motivo?.trim() || null;
  }

  cancelarAceptada(motivo?: string): void {
    if (this.estado !== EstadoSolicitud.ACEPTADA) {
      throw new ConflictException(
        'Solo se puede cancelar una solicitud aceptada',
      );
    }

    this.transicionarA(EstadoSolicitud.CANCELADA);
    this.motivoCancelacion = motivo?.trim() || null;
  }

  finalizar(): void {
    this.transicionarA(EstadoSolicitud.FINALIZADA);
  }

  expirar(): void {
    this.transicionarA(EstadoSolicitud.EXPIRADA);
  }

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
