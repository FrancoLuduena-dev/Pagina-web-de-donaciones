import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"
import { rolUsuario } from "../enums/rol_usuario.enum"
import { estadosUsuario } from "../enums/estados_usuario.enum"

@Entity()
export default class Usuario {
    @PrimaryGeneratedColumn('increment')
    id: number

    @Column({ length: 100 })
    nombreCompleto: string

    @Column({ unique: true, length: 50 })
    nombreUsuario: string

    @Column({ unique: true, length: 100 })
    correo: string

    @Column({ length: 255 })
    contraseña: string

    @Column({ length: 20 })
    numeroTelefono: string

    @Column({
        type: 'enum',
        enum: rolUsuario,
        default: rolUsuario.USUARIO_NORMAL
    })
    rol: rolUsuario

    @Column({
        type: 'enum',
        enum: estadosUsuario,
        default: estadosUsuario.ACTIVO
    })
    estado: estadosUsuario

    @Column({ nullable: true })
    idBloqueador: number | null

    @Column({ nullable: true })
    razonBloqueo: string | null

    @Column({ nullable: true})
    cantidadPublicacionesBloqueadas: number | null
}

/*
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { estados_usuario } from '../enums/estados_usuario.enum';
import { rol_usuario } from '../enums/rol_usuario.enum';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre_completo: string;

  @Column({ unique: true })
  nombre_usuario: string;

  @Column({ unique: true })
  correo: string;

  @Column()
  contraseña: string;

  @Column()
  numero_telefono: string;

  @Column({
    type: 'enum',
    enum: rol_usuario,
  })
  rol: rol_usuario;

  @Column({
    type: 'enum',
    enum: estados_usuario,
  })
  estado: estados_usuario;

  @Column({ nullable: true })
  id_bloqueador: number;

  @Column({ nullable: true })
  razon_bloqueo: string;
}
*/