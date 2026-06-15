import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
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
  @MinLength(10)
  @MaxLength(500)
  comentario?: string;
}
