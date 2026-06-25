import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { rolUsuario } from '../enums/rolUsuario';
import { estadosUsuario } from '../enums/estadosUsuario';

/** * Entidad que representa un usuario dentro del sistema. *
 *  * Contiene información personal, credenciales de acceso, 
 * * estado de la cuenta y datos de moderación. */ 

@Entity('usuarios')
export default class Usuario {
  /** * Identificador único del usuario (UUID). */ 
  @ApiProperty({ description: 'ID único del usuario', example: 'uuid-del-usuario', })
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /** * Nombre completo del usuario. */ 
  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez', })
  @Column({
    length: 100,
  })
  nombreCompleto!: string;

  /** * Nombre de usuario único utilizado en la plataforma. */ 
  @ApiProperty({ description: 'Nombre de usuario único', example: 'juanperez123', })
  @Column({
    unique: true,
    length: 50,
  })
  nombreUsuario!: string;

  /** * Correo electrónico del usuario (único). */ 
  @ApiProperty({ description: 'Correo electrónico del usuario', example: 'juan@email.com', })
  @Column({
    unique: true,
    length: 100,
  })
  correo!: string;

  /** * Contraseña encriptada del usuario. * * 
   * No se selecciona por defecto en consultas por seguridad. */
  @Column({
    length: 255,
    select: false,
  })
  contrasenia!: string;

  /** * Número de teléfono del usuario. */ 
  @ApiProperty({ description: 'Número de teléfono', example: '1123456789', })
  @Column({
    length: 20,
  })
  numeroTelefono!: string;

  /** * Rol del usuario dentro del sistema. * 
   * * Define permisos y capacidades. */ 
  @ApiProperty({ description: 'Rol del usuario', enum: rolUsuario, example: rolUsuario.usuarioNormal, })
  @Column({
    type: 'enum',
    enum: rolUsuario,
    default: rolUsuario.usuarioNormal,
  })
  rol!: rolUsuario;

  /** * Estado actual del usuario. * 
   * * Puede estar activo, bloqueado, etc. */ 
  @ApiProperty({ description: 'Estado del usuario', enum: estadosUsuario, example: estadosUsuario.ACTIVO, })
  @Column({
    type: 'enum',
    enum: estadosUsuario,
    default: estadosUsuario.ACTIVO,
  })
  estado!: estadosUsuario;

  /** * Usuario que realizó el bloqueo (si aplica). * 
   * * Relación opcional para auditoría. */ 
  @ApiProperty({ description: 'Usuario que bloqueó la cuenta', required: false, nullable: true, })
  @ManyToOne(() => Usuario, {
    nullable: true,
  })
  @JoinColumn({
    name: 'bloqueadorId',
  })
  bloqueador?: Usuario | null;

  /** * Motivo del bloqueo del usuario. */ 
  @ApiProperty({ description: 'Razón del bloqueo', example: 'Incumplimiento de normas', required: false, nullable: true, })
  @Column({
    type: 'varchar',
    nullable: true,
  })
  razonBloqueo!: string | null;

  /** * Cantidad de publicaciones bloqueadas del usuario. * 
   * * Utilizado para métricas o decisiones de moderación. */ 
  @ApiProperty({ description: 'Cantidad de publicaciones bloqueadas', example: 3, })
  @Column({
    type: 'int',
    default: 0,
  })
  cantidadPublicacionesBloqueadas!: number;

  /** * Fecha de creación del usuario. */ 
  @ApiProperty({ description: 'Fecha de creación del usuario', example: '2024-01-01T00:00:00.000Z', })
  @CreateDateColumn()
  creadoEn!: Date;

  /** * Fecha de última actualización del usuario. */ 
  @ApiProperty({ description: 'Fecha de última actualización', example: '2024-01-02T00:00:00.000Z', })
  @UpdateDateColumn()
  actualizadoEn!: Date;
}
