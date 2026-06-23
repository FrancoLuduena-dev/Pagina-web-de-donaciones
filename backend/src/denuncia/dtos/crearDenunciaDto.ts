import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

import { MotivoDenuncia } from '../enums/motivoDenuncia';

export class CrearDenunciaDto {
  @IsUUID()
  publicacionId!: string;

  @IsEnum(MotivoDenuncia)
  motivo!: MotivoDenuncia;

  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'El comentario no puede contener solo espacios',
  })
  @MinLength(10)
  @MaxLength(500)
  comentario?: string;
}
