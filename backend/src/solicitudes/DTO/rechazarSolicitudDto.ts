import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RechazarSolicitudDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  motivo?: string;
}
