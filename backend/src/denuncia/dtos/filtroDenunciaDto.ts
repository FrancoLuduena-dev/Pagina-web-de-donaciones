import { IsEnum, IsOptional, IsUUID } from 'class-validator';
import { EstadoDenuncia } from '../enums/estadoDenuncia';

export class FiltroDenunciaDto {
  @IsOptional()
  @IsEnum(EstadoDenuncia)
  estado?: EstadoDenuncia;

  @IsOptional()
  @IsUUID()
  publicacionId?: string;
}
