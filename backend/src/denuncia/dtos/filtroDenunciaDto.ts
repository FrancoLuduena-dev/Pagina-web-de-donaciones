import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

import { EstadoDenuncia } from '../enums/estadoDenuncia';

export class FiltroDenunciaDto {
  @ApiPropertyOptional({
    enum: EstadoDenuncia,
    example: EstadoDenuncia.PENDIENTE,
    description: 'Estado por el cual filtrar las denuncias',
  })
  @IsOptional()
  @IsEnum(EstadoDenuncia)
  estado?: EstadoDenuncia;

  @ApiPropertyOptional({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la publicación denunciada',
  })
  @IsOptional()
  @IsUUID()
  publicacionId?: string;
}
