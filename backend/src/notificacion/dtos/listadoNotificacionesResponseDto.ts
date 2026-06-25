import { ApiProperty } from '@nestjs/swagger';

import { NotificacionResponseDto } from './notificacionResponseDto';

export class ListadoNotificacionesResponseDto {
  @ApiProperty({
    type: NotificacionResponseDto,
    isArray: true,
    description: 'Listado de notificaciones del usuario autenticado',
  })
  notificaciones!: NotificacionResponseDto[];

  @ApiProperty({
    example: 25,
    description: 'Cantidad total de notificaciones encontradas',
  })
  total!: number;

  @ApiProperty({
    example: 1,
    description: 'Página actual del listado',
  })
  pagina!: number;

  @ApiProperty({
    example: 10,
    description: 'Cantidad máxima de notificaciones por página',
  })
  limite!: number;

  @ApiProperty({
    example: 3,
    description: 'Cantidad total de páginas disponibles',
  })
  totalPaginas!: number;
}
