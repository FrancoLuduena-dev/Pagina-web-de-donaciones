import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para el conteo de notificaciones no leídas.
 */
export class CantidadNoLeidasResponseDto {
  /**
   * Cantidad de notificaciones pendientes de lectura para el usuario autenticado.
   */
  @ApiProperty({
    example: 3,
    description: 'Cantidad de notificaciones no leídas del usuario autenticado',
  })
  cantidad!: number;
}
