import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelarSolicitudDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  motivo?: string;
}
