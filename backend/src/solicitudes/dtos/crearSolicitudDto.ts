import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

export class CrearSolicitudDto {
  @ApiProperty({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la publicación sobre la cual se realiza la solicitud',
  })
  @IsUUID()
  publicacionId!: string;

  @ApiPropertyOptional({
    example: 'Hola, me interesa retirar esta donación esta semana.',
    description: 'Mensaje opcional enviado al creador de la publicación',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'El mensaje no puede estar vacío ni contener solo espacios',
  })
  @MaxLength(255)
  mensaje?: string;
}
