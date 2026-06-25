import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { TipoNotificacion } from '../enum/tipoNotificacion';

/**
 * DTO utilizado para crear una notificación desde un evento o una acción del sistema.
 *
 * Permite asociar el aviso a un destinatario y, opcionalmente, a una entidad relacionada.
 */
export class CrearNotificacionDto {
  /**
   * Identificador del usuario destinatario del aviso.
   */
  @ApiProperty({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID del usuario destinatario de la notificación',
  })
  destinatarioId!: string;

  /**
   * Tipo de notificación según el evento que la originó.
   */
  @ApiProperty({
    enum: TipoNotificacion,
    example: TipoNotificacion.SOLICITUD_ACEPTADA,
    description: 'Tipo de notificación a crear',
  })
  tipo!: TipoNotificacion;

  /**
   * Título breve del aviso que verá el usuario.
   */
  @ApiProperty({
    example: 'Nueva solicitud recibida',
    description: 'Título de la notificación',
  })
  titulo!: string;

  /**
   * Mensaje detallado de la notificación.
   */
  @ApiProperty({
    example: 'Un usuario realizó una solicitud sobre tu publicación.',
    description: 'Mensaje de la notificación',
  })
  mensaje!: string;

  /**
   * Identificador de la solicitud asociada a la notificación, si corresponde.
   */
  @ApiPropertyOptional({
    example: 'c1c2c3c4-1111-2222-3333-444455556666',
    description: 'ID de la solicitud relacionada con la notificación',
    nullable: true,
  })
  solicitudId?: string | null;

  /**
   * Identificador de la publicación asociada a la notificación, si corresponde.
   */
  @ApiPropertyOptional({
    example: 'd1d2d3d4-1111-2222-3333-444455556666',
    description: 'ID de la publicación relacionada con la notificación',
    nullable: true,
  })
  publicacionId?: string | null;

  /**
   * Identificador de la denuncia asociada a la notificación, si corresponde.
   */
  @ApiPropertyOptional({
    example: 'e1e2e3e4-1111-2222-3333-444455556666',
    description: 'ID de la denuncia relacionada con la notificación',
    nullable: true,
  })
  denunciaId?: string | null;
}
