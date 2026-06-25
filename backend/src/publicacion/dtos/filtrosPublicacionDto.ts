import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';

import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';

/**
 * DTO con los filtros utilizados para consultar publicaciones.
 *
 * Permite buscar publicaciones por texto, estado, condición, categoría o localidad.
 */
export class FiltrosPublicacionDto {
  @ApiPropertyOptional({
    example: 'campera',
    description: 'Texto de búsqueda para filtrar publicaciones',
  })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    enum: EstadoPublicacion,
    example: EstadoPublicacion.DISPONIBLE,
    description: 'Estado de la publicación',
  })
  @IsOptional()
  @IsEnum(EstadoPublicacion)
  estado?: EstadoPublicacion;

  @ApiPropertyOptional({
    enum: CondicionObjeto,
    example: CondicionObjeto.NUEVO,
    description: 'Condición del objeto publicado',
  })
  @IsOptional()
  @IsEnum(CondicionObjeto)
  condicion?: CondicionObjeto;

  @ApiPropertyOptional({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la categoría',
  })
  @IsOptional()
  @IsString()
  categoriaId?: string;

  @ApiPropertyOptional({
    example: 'a7a9d2e4-1111-4b4a-8888-987654321abc',
    description: 'ID de la localidad',
  })
  @IsOptional()
  @IsString()
  localidadId?: string;
}
