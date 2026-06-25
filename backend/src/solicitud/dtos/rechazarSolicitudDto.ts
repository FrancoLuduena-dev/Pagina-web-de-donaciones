import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/**
 * DTO utilizado para rechazar una solicitud pendiente.
 *
 * Incluye un motivo opcional para registrar la decisión del creador de la publicación.
 */
export class RechazarSolicitudDto {
  /**
   * Motivo opcional por el cual se rechaza la solicitud.
   */
  @ApiPropertyOptional({
    example: 'La publicación ya fue reservada por otra persona.',
    description: 'Motivo opcional por el cual se rechaza la solicitud',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Matches(/\S/, {
    message: 'El motivo no puede estar vacío ni contener solo espacios',
  })
  @MaxLength(255)
  motivo?: string;
}
