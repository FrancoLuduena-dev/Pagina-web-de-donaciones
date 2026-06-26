import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

/**
 * DTO para parametrizar la paginación del listado de notificaciones.
 */
export class PaginacionNotificacionDto {
  /**
   * Número de página a consultar.
   */
  @ApiPropertyOptional({
    example: '1',
    description: 'Número de página a consultar. Debe ser un entero mayor a 0.',
  })
  @IsOptional()
  @Matches(/^[1-9]\d*$/, {
    message: 'La página debe ser un número entero mayor a 0',
  })
  pagina?: string;

  /**
   * Cantidad máxima de notificaciones por página.
   */
  @ApiPropertyOptional({
    example: '10',
    description:
      'Cantidad máxima de notificaciones por página. Debe ser un entero mayor a 0.',
  })
  @IsOptional()
  @Matches(/^[1-9]\d*$/, {
    message: 'El límite debe ser un número entero mayor a 0',
  })
  limite?: string;
}
