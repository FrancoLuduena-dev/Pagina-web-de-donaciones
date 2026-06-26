import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { EstadoDenuncia } from '../enums/estadoDenuncia';

/**
 * Filtros disponibles para consultar denuncias de forma segmentada.
 */
export class FiltroDenunciaDto {
  /**
   * Estado de la denuncia por el cual filtrar.
   */
  @ApiPropertyOptional({
    enum: EstadoDenuncia,
    example: EstadoDenuncia.PENDIENTE,
    description: 'Estado por el cual filtrar las denuncias',
  })
  @IsOptional()
  @IsEnum(EstadoDenuncia)
  estado?: EstadoDenuncia;

  /**
   * Identificador de la publicación relacionada a la denuncia.
   */
  @ApiPropertyOptional({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la publicación denunciada',
  })
  @IsOptional()
  @IsUUID()
  publicacionId?: string;
}
