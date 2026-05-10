import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  VersionColumn,
} from 'typeorm';

import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacionNombre } from '../enums/estadoPublicacion';
import { IEstadoPublicacion } from '../interfaces/iEstadoPublicacion';

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
    name: 'estado',
    type: 'varchar',
    default: 'DISPONIBLE',
  })
  private estado!: EstadoPublicacionNombre;
  estadoInterno!: IEstadoPublicacion;

  @VersionColumn()
  version!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date;
}
