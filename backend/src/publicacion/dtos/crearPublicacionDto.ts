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

import { CondicionObjeto } from '../enums/condicionObjeto';
import { MAX_IMAGENES_PUBLICACION } from '../service/publicacionUploadService';

export class CrearPublicacionDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, { message: 'El título no puede contener solo espacios' })
  @MinLength(4)
  @MaxLength(100)
  titulo!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/, {
    message: 'La descripción no puede contener solo espacios',
  })
  @MinLength(20)
  descripcion!: string;

  @IsUUID()
  @IsNotEmpty()
  categoriaId!: string;

  @IsUUID()
  localidadId!: string;

  @IsEnum(CondicionObjeto)
  condicion!: CondicionObjeto;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_IMAGENES_PUBLICACION)
  @IsUrl({ require_tld: false }, { each: true })
  imagenUrls!: string[];
}
