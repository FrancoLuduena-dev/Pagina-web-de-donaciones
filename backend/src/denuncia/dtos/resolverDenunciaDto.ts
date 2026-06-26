import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

import { TipoResolucion } from '../enums/tipoResolucion';

/**
 * Datos necesarios para resolver una denuncia ya revisada.
 */
export class ResolverDenunciaDto {
  /**
   * Versión actual de la denuncia para validar concurrencia.
   */
  @ApiProperty({
    example: 1,
    description:
      'Versión actual de la denuncia. Se usa para evitar conflictos de concurrencia.',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  version!: number;

  /**
   * Tipo de resolución que aplicará el moderador.
   */
  @ApiProperty({
    enum: TipoResolucion,
    example: TipoResolucion.PUBLICACION_PAUSADA,
    description: 'Tipo de resolución aplicada a la denuncia',
  })
  @IsEnum(TipoResolucion)
  tipoResolucion!: TipoResolucion;

  /**
   * Detalle explicativo de la resolución adoptada.
   */
  @ApiProperty({
    example:
      'Se pausó la publicación porque incumple las reglas de la plataforma.',
    description: 'Detalle de la resolución tomada por el moderador',
    minLength: 15,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'El detalle de resolución no puede contener solo espacios',
  })
  @MinLength(15)
  @MaxLength(500)
  detalleResolucion!: string;
}
