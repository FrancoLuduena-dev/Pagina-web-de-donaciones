import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  IsUrl,
  MinLength,
} from 'class-validator';
import { CondicionObjeto } from '../enums/condicionObjeto';

export class EditarPublicacionDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  titulo?: string;

  @IsOptional()
  @IsString()
  @MinLength(10)
  descripcion?: string;

  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  @IsOptional()
  @IsUUID()
  localidadId?: string;

  @IsOptional()
  @IsEnum(CondicionObjeto)
  condicion?: CondicionObjeto;

  @IsOptional()
  @IsUrl({ require_tld: false })
  imagenUrl?: string;
}
