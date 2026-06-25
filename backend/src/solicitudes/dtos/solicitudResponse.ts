import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { Publicacion } from '../../publicacion/entity/publicacionEntity';
import Usuario from '../../usuario/entity/usuarioEntity';
import { Solicitud } from '../entity/solicitudEntity';
import { EstadoSolicitud } from '../enums/estadoSolicitud';

class PublicacionSolicitudDto {
  @ApiProperty({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la publicación',
  })
  id!: string;

  @ApiProperty({
    example: 'Campera de abrigo para niño',
    description: 'Título de la publicación',
  })
  titulo!: string;
}

class UsuarioSolicitudDto {
  @ApiProperty({
    example: 'c1c2c3c4-1111-2222-3333-444455556666',
    description: 'ID del usuario',
  })
  id!: string;

  @ApiProperty({
    example: 'Mirta perez',
    description: 'Nombre completo del usuario',
  })
  nombre!: string;

  @ApiPropertyOptional({
    example: 'mirta@mail.com',
    description:
      'Email del usuario. Solo se muestra cuando la solicitud está aceptada.',
  })
  email?: string;

  @ApiPropertyOptional({
    example: '1122334455',
    description:
      'Teléfono del usuario. Solo se muestra cuando la solicitud está aceptada.',
  })
  telefono?: string;
}

export class SolicitudResponseDto {
  @ApiProperty({
    example: 'd1d2d3d4-1111-2222-3333-444455556666',
    description: 'ID de la solicitud',
  })
  id!: string;

  @ApiProperty({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la publicación solicitada',
  })
  publicacionId!: string;

  @ApiProperty({
    example: 'c1c2c3c4-1111-2222-3333-444455556666',
    description: 'ID del usuario que realizó la solicitud',
  })
  solicitanteId!: string;

  @ApiProperty({
    example: 'e1e2e3e4-1111-2222-3333-444455556666',
    description: 'ID del usuario creador de la publicación',
  })
  creadorPublicacionId!: string;

  @ApiProperty({
    enum: EstadoSolicitud,
    example: EstadoSolicitud.PENDIENTE,
    description: 'Estado actual de la solicitud',
  })
  estado!: EstadoSolicitud;

  @ApiProperty({
    example: 'Hola, me interesa retirar esta donación esta semana.',
    description: 'Mensaje enviado por el solicitante',
    nullable: true,
  })
  mensaje!: string | null;

  @ApiProperty({
    example: 'La publicación ya fue reservada por otra persona.',
    description: 'Motivo por el cual se rechazó la solicitud',
    nullable: true,
  })
  motivoRechazo!: string | null;

  @ApiProperty({
    example: 'La persona solicitante no podrá retirar la donación.',
    description: 'Motivo por el cual se canceló la solicitud',
    nullable: true,
  })
  motivoCancelacion!: string | null;

  @ApiProperty({
    example: '2026-06-24T22:30:00.000Z',
    description: 'Fecha de creación de la solicitud',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2026-06-24T22:45:00.000Z',
    description: 'Fecha de última actualización de la solicitud',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    type: PublicacionSolicitudDto,
    description: 'Datos resumidos de la publicación solicitada',
  })
  publicacion?: PublicacionSolicitudDto;

  @ApiPropertyOptional({
    type: UsuarioSolicitudDto,
    description: 'Datos resumidos del usuario solicitante',
  })
  solicitante?: UsuarioSolicitudDto;

  @ApiPropertyOptional({
    type: UsuarioSolicitudDto,
    description: 'Datos resumidos del usuario creador de la publicación',
  })
  creadorPublicacion?: UsuarioSolicitudDto;

  static desdeEntidad(
    solicitud: Solicitud,
    usuarioActualId: string,
  ): SolicitudResponseDto {
    const mostrarContacto =
      solicitud.estado === EstadoSolicitud.ACEPTADA &&
      (solicitud.solicitanteId === usuarioActualId ||
        solicitud.creadorPublicacionId === usuarioActualId);

    return {
      id: solicitud.id,
      publicacionId: solicitud.publicacionId,
      solicitanteId: solicitud.solicitanteId,
      creadorPublicacionId: solicitud.creadorPublicacionId,
      estado: solicitud.estado,
      mensaje: solicitud.mensaje ?? null,
      motivoRechazo: solicitud.motivoRechazo ?? null,
      motivoCancelacion: solicitud.motivoCancelacion ?? null,
      createdAt: solicitud.createdAt,
      updatedAt: solicitud.updatedAt,
      publicacion: solicitud.publicacion
        ? this.mapearPublicacion(solicitud.publicacion)
        : undefined,
      solicitante: solicitud.solicitante
        ? this.mapearUsuario(solicitud.solicitante, mostrarContacto)
        : undefined,
      creadorPublicacion: solicitud.creadorPublicacion
        ? this.mapearUsuario(solicitud.creadorPublicacion, mostrarContacto)
        : undefined,
    };
  }

  private static mapearPublicacion(
    publicacion: Publicacion,
  ): PublicacionSolicitudDto {
    return {
      id: publicacion.id,
      titulo: publicacion.titulo,
    };
  }

  private static mapearUsuario(
    usuario: Usuario,
    mostrarContacto: boolean,
  ): UsuarioSolicitudDto {
    const usuarioMapeado: UsuarioSolicitudDto = {
      id: usuario.id,
      nombre: usuario.nombreCompleto,
    };

    if (mostrarContacto) {
      usuarioMapeado.email = usuario.correo;
      usuarioMapeado.telefono = usuario.numeroTelefono;
    }

    return usuarioMapeado;
  }
}
