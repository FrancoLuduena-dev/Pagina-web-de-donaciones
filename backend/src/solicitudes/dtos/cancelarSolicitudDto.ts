import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CancelarSolicitudDto {
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
