import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CancelarSolicitudDto {
  @IsOptional()
  @IsString()
  @Matches(/^(?:|.*\S.*)$/, {
    message: 'El motivo no puede contener solo espacios',
  })
  @MaxLength(255)
  motivo?: string;
}
