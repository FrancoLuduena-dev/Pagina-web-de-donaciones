import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

/**
 * DTO utilizado para cancelar una solicitud o una reserva ya creada.
 *
 * Permite incorporar un motivo de cancelación sin alterar el flujo de negocio.
 */
export class CancelarSolicitudDto {
  /**
   * Motivo opcional por el cual se cancela la solicitud o la reserva.
   */
  @ApiPropertyOptional({
    example: 'La persona solicitante no podrá retirar la donación.',
    description:
      'Motivo opcional por el cual se cancela la solicitud o reserva',
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
