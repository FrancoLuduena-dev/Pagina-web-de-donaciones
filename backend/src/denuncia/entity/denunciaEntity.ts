import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MotivoDenuncia } from '../enums/motivoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';
import { EstadoDenuncia } from '../enums/estadoDenuncia';

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

  tomar(moderadorId: string): void {
    if (this.estado !== EstadoDenuncia.PENDIENTE) {
      throw new Error('TRANSICION_ESTADO_INVALIDA');
    }

    this.estado = EstadoDenuncia.EN_REVISION;
    this.moderadorAsignadoId = moderadorId;
    this.version += 1;
  }
}
