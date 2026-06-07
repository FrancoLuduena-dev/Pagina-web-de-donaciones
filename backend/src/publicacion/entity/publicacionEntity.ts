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

import { BadRequestException } from '@nestjs/common';
import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { EditarPublicacionDto } from '../DTOS/editarPublicacionDto';
import { TRANSICIONES_PUBLICACION } from '../constante/transicionesPublicacion';
import { Solicitud } from '../../solicitudes/entity/solicitudEntity';

@Entity('publicacion')
export class Publicacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  creadorId!: string;

  @Column({ length: 100 })
  titulo!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @Column({ type: 'uuid' })
  categoriaId!: string;

  @Column({ type: 'uuid' })
  localidadId!: string;

  @Column({
    type: 'enum',
    enum: CondicionObjeto,
  })
  condicion!: CondicionObjeto;

  @Column()
  imagenUrl!: string;

  @Column({
    type: 'enum',
    enum: EstadoPublicacion,
    default: EstadoPublicacion.DISPONIBLE,
  })
  estado!: EstadoPublicacion;

  @VersionColumn()
  version!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;

  @OneToMany(() => Solicitud, (solicitud) => solicitud.publicacion)
  solicitudes!: Solicitud[];

  transicionarA(nuevoEstado: EstadoPublicacion): void {
    const permitidos = TRANSICIONES_PUBLICACION[this.estado];

    if (!permitidos.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede pasar de ${this.estado} a ${nuevoEstado}`,
      );
    }

    this.estado = nuevoEstado;
  }

  reservar(): void {
    this.transicionarA(EstadoPublicacion.RESERVADA);
  }

  pausar(): void {
    this.transicionarA(EstadoPublicacion.PAUSADA);
  }

  reactivar(): void {
    this.transicionarA(EstadoPublicacion.DISPONIBLE);
  }

  entregar(): void {
    this.transicionarA(EstadoPublicacion.ENTREGADA);
  }

  eliminar(): void {
    this.transicionarA(EstadoPublicacion.ELIMINADA);

    this.deletedAt = new Date();
  }

  cancelarReserva(): void {
    this.transicionarA(EstadoPublicacion.DISPONIBLE);
  }

  puedeEditar(): boolean {
    return (
      this.estado === EstadoPublicacion.DISPONIBLE ||
      this.estado === EstadoPublicacion.PAUSADA
    );
  }

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

    if (datos.imagenUrl !== undefined) {
      this.imagenUrl = datos.imagenUrl;
    }

    if (datos.condicion !== undefined) {
      this.condicion = datos.condicion;
    }

    this.updatedAt = new Date();
  }
}
