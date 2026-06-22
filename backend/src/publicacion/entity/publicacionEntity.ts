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

import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { EditarPublicacionDto } from '../dtos/editarPublicacionDto';
import { TRANSICIONES_PUBLICACION } from '../constante/transicionesPublicacion';
import { Solicitud } from '../../solicitudes/entity/solicitudEntity';
import { rolUsuario } from '../../usuario/enums/rolUsuario';

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

  @Column({ type: 'jsonb', default: [] })
  imagenUrls!: string[];

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

  validarCreador(
    usuarioId: string,
    mensaje = 'Solo el creador puede realizar esta acción',
  ): void {
    if (this.creadorId !== usuarioId) {
      throw new ForbiddenException(mensaje);
    }
  }

  validarNoEsCreador(
    usuarioId: string,
    mensaje = 'No podés realizar esta acción sobre tu propia publicación',
  ): void {
    if (this.creadorId === usuarioId) {
      throw new ForbiddenException(mensaje);
    }
  }

  validarPuedeSerGestionadaPor(
    usuarioId: string,
    usuarioRol: rolUsuario,
    mensaje = 'No tenés permisos para gestionar esta publicación',
  ): void {
    const esCreador = this.creadorId === usuarioId;
    const esModerador = usuarioRol === rolUsuario.usuarioModerador;
    const esAdministrador = usuarioRol === rolUsuario.usuarioAdministrador;

    if (!esCreador && !esModerador && !esAdministrador) {
      throw new ForbiddenException(mensaje);
    }
  }

  validarPuedeRecibirSolicitudes(): void {
    if (this.estado !== EstadoPublicacion.DISPONIBLE) {
      throw new BadRequestException(
        'La publicación no está disponible para recibir solicitudes',
      );
    }
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

    if (datos.imagenUrls !== undefined) {
      this.imagenUrls = datos.imagenUrls;
    }

    if (datos.condicion !== undefined) {
      this.condicion = datos.condicion;
    }

    if (datos.categoriaId !== undefined) {
      this.categoriaId = datos.categoriaId;
    }

    if (datos.localidadId !== undefined) {
      this.localidadId = datos.localidadId;
    }

    this.updatedAt = new Date();
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

  private transicionarA(nuevoEstado: EstadoPublicacion): void {
    const permitidos = TRANSICIONES_PUBLICACION[this.estado];

    if (!permitidos.includes(nuevoEstado)) {
      throw new BadRequestException(
        `No se puede pasar de ${this.estado} a ${nuevoEstado}`,
      );
    }

    this.estado = nuevoEstado;
  }
}
