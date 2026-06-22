import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { TipoResolucion } from '../enums/tipoResolucion';

export class ResolverDenunciaDto {
  @IsInt()
  @Min(1)
  version!: number;

  @IsEnum(TipoResolucion)
  tipoResolucion!: TipoResolucion;

  @IsString()
  @IsNotEmpty()
  @MinLength(15)
  @MaxLength(500)
  detalleResolucion!: string;
}
