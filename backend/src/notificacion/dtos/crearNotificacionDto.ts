import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { TipoNotificacion } from '../enum/tipoNotificacion';

export class CrearNotificacionDto {
  @ApiProperty({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID del usuario destinatario de la notificación',
  })
  destinatarioId!: string;

  @ApiProperty({
    enum: TipoNotificacion,
    example: TipoNotificacion.SOLICITUD_ACEPTADA,
    description: 'Tipo de notificación a crear',
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

  @ApiPropertyOptional({
    example: 'c1c2c3c4-1111-2222-3333-444455556666',
    description: 'ID de la solicitud relacionada con la notificación',
    nullable: true,
  })
  solicitudId?: string | null;

  @ApiPropertyOptional({
    example: 'd1d2d3d4-1111-2222-3333-444455556666',
    description: 'ID de la publicación relacionada con la notificación',
    nullable: true,
  })
  publicacionId?: string | null;

  @ApiPropertyOptional({
    example: 'e1e2e3e4-1111-2222-3333-444455556666',
    description: 'ID de la denuncia relacionada con la notificación',
    nullable: true,
  })
  denunciaId?: string | null;
}
