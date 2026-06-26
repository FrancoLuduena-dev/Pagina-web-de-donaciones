import { ApiProperty } from '@nestjs/swagger';

import { TipoNotificacion } from '../enum/tipoNotificacion';
import { Notificacion } from '../entity/notificacionEntity';

/**
 * DTO de respuesta que representa una notificación en la API.
 *
 * Expone el estado de lectura y los datos básicos del aviso para que el usuario
 * pueda visualizarlo y reconocer el contexto del evento.
 */
export class NotificacionResponseDto {
  /**
   * Identificador de la notificación.
   */
  @ApiProperty({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la notificación',
  })
  id!: string;

  /**
   * Tipo de notificación según el evento que la originó.
   */
  @ApiProperty({
    enum: TipoNotificacion,
    example: TipoNotificacion.SOLICITUD_CREADA,
    description: 'Tipo de notificación',
  })
  tipo!: TipoNotificacion;

  /**
   * Título breve del aviso.
   */
  @ApiProperty({
    example: 'Nueva solicitud recibida',
    description: 'Título de la notificación',
  })
  titulo!: string;

  /**
   * Mensaje detallado del aviso.
   */
  @ApiProperty({
    example: 'Un usuario realizó una solicitud sobre tu publicación.',
    description: 'Mensaje de la notificación',
  })
  mensaje!: string;

  /**
   * Indica si la notificación ya fue marcada como leída por el usuario.
   */
  @ApiProperty({
    example: false,
    description: 'Indica si la notificación fue leída',
  })
  leida!: boolean;

  /**
   * Fecha en la que la notificación fue marcada como leída.
   */
  @ApiProperty({
    example: '2026-06-24T22:45:00.000Z',
    description: 'Fecha en la que la notificación fue leída',
    nullable: true,
  })
  leidaEn!: Date | null;

  /**
   * Identificador de la solicitud relacionada, si aplica.
   */
  @ApiProperty({
    example: 'c1c2c3c4-1111-2222-3333-444455556666',
    description: 'ID de la solicitud relacionada',
    nullable: true,
  })
  solicitudId!: string | null;

  /**
   * Identificador de la publicación relacionada, si aplica.
   */
  @ApiProperty({
    example: 'd1d2d3d4-1111-2222-3333-444455556666',
    description: 'ID de la publicación relacionada',
    nullable: true,
  })
  publicacionId!: string | null;

  /**
   * Identificador de la denuncia relacionada, si aplica.
   */
  @ApiProperty({
    example: 'e1e2e3e4-1111-2222-3333-444455556666',
    description: 'ID de la denuncia relacionada',
    nullable: true,
  })
  denunciaId!: string | null;

  /**
   * Fecha de creación de la notificación.
   */
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
