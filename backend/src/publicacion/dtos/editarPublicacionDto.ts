import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

import { CondicionObjeto } from '../enums/condicionObjeto';
import { MAX_IMAGENES_PUBLICACION } from '../service/publicacionUploadService';

export class EditarPublicacionDto {
  @ApiPropertyOptional({
    example: 'Campera de abrigo para niño',
    description: 'Nuevo título de la publicación',
    minLength: 3,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'El título no puede contener solo espacios' })
  @MinLength(3)
  @MaxLength(100)
  titulo?: string;

  @ApiPropertyOptional({
    example:
      'Campera en buen estado, sin roturas, ideal para temporada de invierno.',
    description: 'Nueva descripción de la publicación',
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'La descripción no puede contener solo espacios',
  })
  @MinLength(10)
  descripcion?: string;

  @ApiPropertyOptional({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'Nuevo ID de categoría',
  })
  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  @ApiPropertyOptional({
    example: 'a7a9d2e4-1111-4b4a-8888-987654321abc',
    description: 'Nuevo ID de localidad',
  })
  @IsOptional()
  @IsUUID()
  localidadId?: string;

  @ApiPropertyOptional({
    enum: CondicionObjeto,
    example: CondicionObjeto.NUEVO,
    description: 'Nueva condición del objeto',
  })
  @IsOptional()
  @IsEnum(CondicionObjeto)
  condicion?: CondicionObjeto;

  @ApiPropertyOptional({
    example: ['/uploads/publicaciones/imagen-123.jpg'],
    description: 'Nueva lista de URLs de imágenes',
    type: [String],
    minItems: 1,
    maxItems: MAX_IMAGENES_PUBLICACION,
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_IMAGENES_PUBLICACION)
  @IsUrl({ require_tld: false }, { each: true })
  imagenUrls?: string[];
}
