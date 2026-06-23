import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CrearSolicitudDto {
  @IsUUID()
  publicacionId!: string;

  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'El mensaje no puede estar vacío ni contener solo espacios',
  })
  @MaxLength(255)
  mensaje?: string;
}
