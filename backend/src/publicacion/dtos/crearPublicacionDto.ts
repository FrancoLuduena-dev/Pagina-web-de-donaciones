/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

import { CondicionObjeto } from '../enums/condicionObjeto';
import { MAX_IMAGENES_PUBLICACION } from '../service/publicacionUploadService';

export class CrearPublicacionDto {
  @ApiProperty({
    example: 'Campera de abrigo para niño',
    description: 'Título breve de la publicación',
    minLength: 4,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'El título no puede contener solo espacios' })
  @MinLength(4)
  @MaxLength(100)
  titulo!: string;

  @ApiProperty({
    example:
      'Campera en buen estado, sin roturas, ideal para temporada de invierno.',
    description: 'Descripción detallada del objeto publicado',
    minLength: 20,
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'La descripción no puede contener solo espacios',
  })
  @MinLength(20)
  descripcion!: string;

  @ApiProperty({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la categoría asociada a la publicación',
  })
  @IsUUID()
  @IsNotEmpty()
  categoriaId!: string;

  @ApiProperty({
    example: 'a7a9d2e4-1111-4b4a-8888-987654321abc',
    description: 'ID de la localidad asociada a la publicación',
  })
  @IsUUID()
  localidadId!: string;

  @ApiProperty({
    enum: CondicionObjeto,
    example: CondicionObjeto.NUEVO,
    description: 'Condición en la que se encuentra el objeto',
  })
  @IsEnum(CondicionObjeto)
  condicion!: CondicionObjeto;

  @ApiProperty({
    example: ['/uploads/publicaciones/imagen-123.jpg'],
    description: 'URLs de las imágenes previamente subidas',
    type: [String],
    minItems: 1,
    maxItems: MAX_IMAGENES_PUBLICACION,
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_IMAGENES_PUBLICACION)
  @IsUrl({ require_tld: false }, { each: true })
  imagenUrls!: string[];
}
