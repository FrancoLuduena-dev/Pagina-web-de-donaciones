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
import { Solicitud } from '../../solicitud/entity/solicitudEntity';
import Usuario from '../../usuario/entity/usuarioEntity';
import { TipoNotificacion } from '../enum/tipoNotificacion';

/**
 * Entidad que representa un aviso generado por el sistema para informar a un usuario.
 *
 * Cada notificación puede estar asociada a un hecho relevante del dominio, como
 * una solicitud, una publicación o una denuncia, y su estado de lectura permite
 * distinguir entre mensajes pendientes y mensajes ya revisados.
 */
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
  /**
   * Identificador único de la notificación.
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Identificador del usuario destinatario del aviso.
   */
  @Column({ type: 'uuid' })
  destinatarioId!: string;

  @ManyToOne(() => Usuario, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'destinatarioId' })
  destinatario!: Usuario;

  /**
   * Clasificación del aviso según el evento que lo originó.
   */
  @Column({
    type: 'enum',
    enum: TipoNotificacion,
  })
  tipo!: TipoNotificacion;

  /**
   * Título resumido del mensaje para mostrar al usuario.
   */
  @Column({ length: 100 })
  titulo!: string;

  /**
   * Cuerpo detallado del aviso informativo.
   */
  @Column({ type: 'text' })
  mensaje!: string;

  /**
   * Fecha en la que la notificación fue marcada como leída.
   *
   * Cuando es null, la notificación sigue pendiente de revisión por parte del usuario.
   */
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

  /**
   * Fecha de creación de la notificación.
   */
  @CreateDateColumn()
  creadaEn!: Date;

  /**
   * Marca la notificación como leída si aún no lo estaba.
   *
   * Esta operación permite distinguir entre avisos pendientes de revisar y
   * avisos ya consultados por el usuario.
   */
  marcarComoLeida(): void {
    if (!this.leidaEn) {
      this.leidaEn = new Date();
    }
  }
}
