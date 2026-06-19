import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';

import { EstadoSolicitud } from '../enums/estadoSolicitud';
import { TRANSICIONES_SOLICITUD } from '../constante/transicionesSolicitud';
import { Publicacion } from '../../publicacion/entity/publicacionEntity';

@Entity('solicitudes')
export class Solicitud {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  publicacionId!: string;

  @ManyToOne(() => Publicacion, (publicacion) => publicacion.solicitudes)
  @JoinColumn({ name: 'publicacionId' })
  publicacion!: Publicacion;

  @Column()
  solicitanteId!: string;

  @Column()
  creadorPublicacionId!: string;

  @Column({ nullable: true })
  mensaje?: string;

  @Column({
    type: 'enum',
    enum: EstadoSolicitud,
    default: EstadoSolicitud.PENDIENTE,
  })
  estado!: EstadoSolicitud;

  @Column({ nullable: true })
  motivoRechazo?: string;

  @Column({ nullable: true })
  motivoCancelacion?: string;

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

  private validarTransicionSolicitud(nuevoEstado: EstadoSolicitud): void {
    const transicionesPermitidas = TRANSICIONES_SOLICITUD[this.estado];

    if (!transicionesPermitidas.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede cambiar una solicitud de ${this.estado} a ${nuevoEstado}`,
      );
    }

    this.estado = nuevoEstado;
  }

  aceptar(): void {
    this.validarTransicionSolicitud(EstadoSolicitud.ACEPTADA);
  }

  rechazar(motivo?: string): void {
    this.validarTransicionSolicitud(EstadoSolicitud.RECHAZADA);
    this.motivoRechazo = motivo;
  }

  cancelar(motivo?: string): void {
    this.validarTransicionSolicitud(EstadoSolicitud.CANCELADA);
    this.motivoCancelacion = motivo;
  }

  finalizar(): void {
    this.validarTransicionSolicitud(EstadoSolicitud.FINALIZADA);
  }

  expirar(): void {
    this.validarTransicionSolicitud(EstadoSolicitud.EXPIRADA);
  }
}
