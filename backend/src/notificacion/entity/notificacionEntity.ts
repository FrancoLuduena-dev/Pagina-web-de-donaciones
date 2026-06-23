import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Denuncia } from '../../denuncia/entity/denunciaEntity';
import { Publicacion } from '../../publicacion/entity/publicacionEntity';
import { Solicitud } from '../../solicitudes/entity/solicitudEntity';
import Usuario from '../../usuario/entity/usuarioEntity';
import { TipoNotificacion } from '../enum/tipoNotificacion';

@Entity('notificaciones')
@Check(
  'CHK_NOTIFICACION_UNA_REFERENCIA',
  `num_nonnulls("solicitudId", "publicacionId", "denunciaId") <= 1`,
)
@Index('IDX_NOTIFICACION_DESTINATARIO_FECHA', ['destinatarioId', 'creadaEn'])
@Index('IDX_NOTIFICACION_NO_LEIDA', ['destinatarioId'], {
  where: '"leidaEn" IS NULL',
})
export class Notificacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  destinatarioId!: string;

  @ManyToOne(() => Usuario, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'destinatarioId' })
  destinatario!: Usuario;

  @Column({
    type: 'enum',
    enum: TipoNotificacion,
  })
  tipo!: TipoNotificacion;

  @Column({ length: 100 })
  titulo!: string;

  @Column({ type: 'text' })
  mensaje!: string;

  @Column({ type: 'timestamp', nullable: true })
  leidaEn!: Date | null;

  @Column({ type: 'uuid', nullable: true })
  solicitudId!: string | null;

  @ManyToOne(() => Solicitud, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'solicitudId' })
  solicitud!: Solicitud | null;

  @Column({ type: 'uuid', nullable: true })
  publicacionId!: string | null;

  @ManyToOne(() => Publicacion, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'publicacionId' })
  publicacion!: Publicacion | null;

  @Column({ type: 'uuid', nullable: true })
  denunciaId!: string | null;

  @ManyToOne(() => Denuncia, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'denunciaId' })
  denuncia!: Denuncia | null;

  @CreateDateColumn()
  creadaEn!: Date;

  marcarComoLeida(): void {
    if (!this.leidaEn) {
      this.leidaEn = new Date();
    }
  }
}
