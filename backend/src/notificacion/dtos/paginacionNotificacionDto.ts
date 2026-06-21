import { IsOptional, Matches } from 'class-validator';

export class PaginacionNotificacionDto {
  @IsOptional()
  @Matches(/^[1-9]\d*$/, {
    message: 'La página debe ser un número entero mayor a 0',
  })
  pagina?: string;

  @IsOptional()
  @Matches(/^[1-9]\d*$/, {
    message: 'El límite debe ser un número entero mayor a 0',
  })
  limite?: string;
}
