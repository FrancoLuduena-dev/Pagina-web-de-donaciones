import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

/**
 * DTO utilizado para iniciar una solicitud sobre una publicación.
 *
 * Se emplea en el flujo de creación de solicitudes y contiene el identificador
 * de la publicación objetivo y, de forma opcional, un mensaje para el creador.
 */
export class CrearSolicitudDto {
  /**
   * Identificador de la publicación sobre la que se realiza la solicitud.
   */
  @ApiProperty({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la publicación sobre la cual se realiza la solicitud',
  })
  @IsUUID()
  publicacionId!: string;

  /**
   * Mensaje opcional enviado por el solicitante al creador de la publicación.
   */
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
