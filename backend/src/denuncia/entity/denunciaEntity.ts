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

@Entity('denuncias')
export class Denuncia {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  publicacionId!: string;

  @Column({ type: 'uuid' })
  denuncianteId!: string;

  @Column({ type: 'uuid' })
  creadorPublicacionId!: string;

  @Column({
    type: 'enum',
    enum: MotivoDenuncia,
  })
  motivo!: MotivoDenuncia;

  @Column({ type: 'varchar', length: 500, nullable: true })
  comentario?: string | null;

  @Column({
    type: 'enum',
    enum: EstadoDenuncia,
    default: EstadoDenuncia.PENDIENTE,
  })
  estado!: EstadoDenuncia;

  @Column({ type: 'uuid', nullable: true })
  moderadorAsignadoId?: string | null;

  @Column({
    type: 'enum',
    enum: TipoResolucion,
    nullable: true,
  })
  tipoResolucion?: TipoResolucion | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  detalleResolucion?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  fechaResolucion?: Date | null;

  @Column({ type: 'int', default: 1 })
  version!: number;

  @CreateDateColumn()
  fechaCreacion!: Date;

  @UpdateDateColumn()
  fechaActualizacion!: Date;

  validarNoEsCreadorPublicacion(
    usuarioId: string,
    mensaje = 'No podés denunciar tu propia publicación',
  ): void {
    if (this.creadorPublicacionId === usuarioId) {
      throw new ForbiddenException(mensaje);
    }
  }

  validarModeradorAsignado(
    moderadorId: string,
    mensaje = 'Solo el moderador asignado puede realizar esta acción',
  ): void {
    if (this.moderadorAsignadoId !== moderadorId) {
      throw new ForbiddenException(mensaje);
    }
  }

  validarPuedeResolver(moderadorId: string): void {
    if (this.estado !== EstadoDenuncia.EN_REVISION) {
      throw new BadRequestException('DENUNCIA_DEBE_ESTAR_EN_REVISION');
    }

    this.validarModeradorAsignado(
      moderadorId,
      'SOLO_MODERADOR_ASIGNADO_PUEDE_RESOLVER',
    );
  }

  tomar(moderadorId: string): void {
    this.cambiarEstado(EstadoDenuncia.EN_REVISION);

    this.moderadorAsignadoId = moderadorId;
    this.version += 1;
  }

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

  private cambiarEstado(nuevoEstado: EstadoDenuncia): void {
    if (!puedeTransicionarDenuncia(this.estado, nuevoEstado)) {
      throw new BadRequestException(
        `No se puede cambiar una denuncia de ${this.estado} a ${nuevoEstado}`,
      );
    }

    this.estado = nuevoEstado;
  }
}
