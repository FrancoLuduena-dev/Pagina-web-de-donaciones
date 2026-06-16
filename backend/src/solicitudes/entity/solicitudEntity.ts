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

import { BadRequestException } from '@nestjs/common';

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
