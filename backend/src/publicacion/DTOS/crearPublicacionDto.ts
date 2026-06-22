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
  MinLength,
} from 'class-validator';

import { CondicionObjeto } from '../enums/condicionObjeto';
import { MAX_IMAGENES_PUBLICACION } from '../service/publicacionUploadService';

export class CrearPublicacionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(4)
  titulo!: string;

  @IsString()
  @IsNotEmpty()
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
