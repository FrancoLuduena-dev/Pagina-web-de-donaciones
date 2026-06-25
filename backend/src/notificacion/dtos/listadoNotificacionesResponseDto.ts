import { ApiProperty } from '@nestjs/swagger';

import { NotificacionResponseDto } from './notificacionResponseDto';

/**
 * DTO de respuesta para el listado paginado de notificaciones.
 */
export class ListadoNotificacionesResponseDto {
  /**
   * Colección de notificaciones devueltas para el usuario autenticado.
   */
  @ApiProperty({
    type: NotificacionResponseDto,
    isArray: true,
    description: 'Listado de notificaciones del usuario autenticado',
  })
  notificaciones!: NotificacionResponseDto[];

  /**
   * Cantidad total de notificaciones encontradas.
   */
  @ApiProperty({
    example: 25,
    description: 'Cantidad total de notificaciones encontradas',
  })
  total!: number;

  /**
   * Página actual del listado.
   */
  @ApiProperty({
    example: 1,
    description: 'Página actual del listado',
  })
  pagina!: number;

  /**
   * Cantidad máxima de notificaciones por página.
   */
  @ApiProperty({
    example: 10,
    description: 'Cantidad máxima de notificaciones por página',
  })
  limite!: number;

  /**
   * Cantidad total de páginas disponibles.
   */
  @ApiProperty({
    example: 3,
    description: 'Cantidad total de páginas disponibles',
  })
  totalPaginas!: number;
}
