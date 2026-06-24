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
import { CondicionObjeto } from '../enums/condicionObjeto';
import { MAX_IMAGENES_PUBLICACION } from '../service/publicacionUploadService';

export class EditarPublicacionDto {
  @IsOptional()
  @IsString()
  @Matches(/\S/, { message: 'El título no puede contener solo espacios' })
  @MinLength(3)
  @MaxLength(100)
  titulo?: string;

  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'La descripción no puede contener solo espacios',
  })
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
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(MAX_IMAGENES_PUBLICACION)
  @IsUrl({ require_tld: false }, { each: true })
  imagenUrls?: string[];
}
