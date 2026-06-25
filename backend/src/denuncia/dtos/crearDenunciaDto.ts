import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { MotivoDenuncia } from '../enums/motivoDenuncia';

/**
 * Datos requeridos para registrar una denuncia sobre una publicación.
 */
export class CrearDenunciaDto {
  /**
   * Identificador de la publicación que será denunciada.
   */
  @ApiProperty({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la publicación denunciada',
  })
  @IsUUID()
  publicacionId!: string;

  /**
   * Motivo de la denuncia seleccionada por el usuario.
   */
  @ApiProperty({
    enum: MotivoDenuncia,
    example: MotivoDenuncia.PUBLICACION_FALSA,
    description: 'Motivo por el cual se realiza la denuncia',
  })
  @IsEnum(MotivoDenuncia)
  motivo!: MotivoDenuncia;

  /**
   * Comentario opcional con más contexto sobre la denuncia.
   */
  @ApiPropertyOptional({
    example: 'La publicación contiene información falsa o engañosa.',
    description: 'Comentario adicional sobre la denuncia',
    minLength: 10,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'El comentario no puede contener solo espacios',
  })
  @MinLength(10)
  @MaxLength(500)
  comentario?: string;
}
