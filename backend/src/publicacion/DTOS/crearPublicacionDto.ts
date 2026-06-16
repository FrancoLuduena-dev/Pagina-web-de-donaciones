/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  IsUUID,
  MinLength,
} from 'class-validator';

import { CondicionObjeto } from '../enums/condicionObjeto';

export class CrearPublicacionDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(10)
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

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  imagenUrl!: string;
}
