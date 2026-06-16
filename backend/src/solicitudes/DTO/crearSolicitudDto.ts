import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CrearSolicitudDto {
  @IsUUID()
  publicacionId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  mensaje?: string;
}
