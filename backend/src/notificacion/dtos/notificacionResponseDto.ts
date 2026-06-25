import { ApiProperty } from '@nestjs/swagger';

import { TipoNotificacion } from '../enum/tipoNotificacion';
import { Notificacion } from '../entity/notificacionEntity';

export class NotificacionResponseDto {
  @ApiProperty({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la notificación',
  })
  id!: string;

  @ApiProperty({
    enum: TipoNotificacion,
    example: 'SOLICITUD_RECIBIDA',
    description: 'Tipo de notificación',
  })
  tipo!: TipoNotificacion;

  @ApiProperty({
    example: 'Nueva solicitud recibida',
    description: 'Título de la notificación',
  })
  titulo!: string;

  @ApiProperty({
    example: 'Un usuario realizó una solicitud sobre tu publicación.',
    description: 'Mensaje de la notificación',
  })
  mensaje!: string;

  @ApiProperty({
    example: false,
    description: 'Indica si la notificación fue leída',
  })
  leida!: boolean;

  @ApiProperty({
    example: '2026-06-24T22:45:00.000Z',
    description: 'Fecha en la que la notificación fue leída',
    nullable: true,
  })
  leidaEn!: Date | null;

  @ApiProperty({
    example: 'c1c2c3c4-1111-2222-3333-444455556666',
    description: 'ID de la solicitud relacionada',
    nullable: true,
  })
  solicitudId!: string | null;

  @ApiProperty({
    example: 'd1d2d3d4-1111-2222-3333-444455556666',
    description: 'ID de la publicación relacionada',
    nullable: true,
  })
  publicacionId!: string | null;

  @ApiProperty({
    example: 'e1e2e3e4-1111-2222-3333-444455556666',
    description: 'ID de la denuncia relacionada',
    nullable: true,
  })
  denunciaId!: string | null;

  @ApiProperty({
    example: '2026-06-24T22:30:00.000Z',
    description: 'Fecha de creación de la notificación',
  })
  creadaEn!: Date;

  static mapearDesdeEntidad(
    notificacion: Notificacion,
  ): NotificacionResponseDto {
    return {
      id: notificacion.id,
      tipo: notificacion.tipo,
      titulo: notificacion.titulo,
      mensaje: notificacion.mensaje,
      leida: notificacion.leidaEn !== null,
      leidaEn: notificacion.leidaEn,
      solicitudId: notificacion.solicitudId,
      publicacionId:
        notificacion.publicacionId ??
        notificacion.solicitud?.publicacionId ??
        notificacion.denuncia?.publicacionId ??
        null,
      denunciaId: notificacion.denunciaId,
      creadaEn: notificacion.creadaEn,
    };
  }
}
