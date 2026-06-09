import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { rolUsuario } from '../enums/rolUsuario';
import { estadosUsuario } from '../enums/estadosUsuario';

@Entity('usuarios')
export default class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    length: 100,
  })
  nombreCompleto!: string;

  @Column({
    unique: true,
    length: 50,
  })
  nombreUsuario!: string;

  @Column({
    unique: true,
    length: 100,
  })
  correo!: string;

  @Column({
    length: 255,
  })
  contrasenia!: string;

  @Column({
    length: 20,
  })
  numeroTelefono!: string;

  @Column({
    type: 'enum',
    enum: rolUsuario,
    default: rolUsuario.usuarioNormal,
  })
  rol!: rolUsuario;

  @Column({
    type: 'enum',
    enum: estadosUsuario,
    default: estadosUsuario.ACTIVO,
  })
  estado!: estadosUsuario;

  @ManyToOne(() => Usuario, {
    nullable: true,
  })
  @JoinColumn({
    name: 'bloqueadorId',
  })
  bloqueador?: Usuario | null;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  razonBloqueo!: string | null;

  @Column({
    type: 'int',
    default: 0,
  })
  cantidadPublicacionesBloqueadas!: number;

  @CreateDateColumn()
  creadoEn!: Date;

  @UpdateDateColumn()
  actualizadoEn!: Date;
}
