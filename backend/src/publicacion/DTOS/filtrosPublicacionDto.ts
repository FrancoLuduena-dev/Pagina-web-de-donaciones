import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';

export class FiltrosPublicacionDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsEnum(EstadoPublicacion)
  estado?: EstadoPublicacion;

  @IsOptional()
  @IsEnum(CondicionObjeto)
  condicion?: CondicionObjeto;

  @IsOptional()
  @IsUUID()
  categoriaId?: string;

  @IsOptional()
  @IsUUID()
  localidadId?: string;
}
