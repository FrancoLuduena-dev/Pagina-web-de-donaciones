import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, Matches } from 'class-validator';

export class PaginacionNotificacionDto {
  @ApiPropertyOptional({
    example: '1',
    description: 'Número de página a consultar. Debe ser un entero mayor a 0.',
  })
  @IsOptional()
  @Matches(/^[1-9]\d*$/, {
    message: 'La página debe ser un número entero mayor a 0',
  })
  pagina?: string;

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
