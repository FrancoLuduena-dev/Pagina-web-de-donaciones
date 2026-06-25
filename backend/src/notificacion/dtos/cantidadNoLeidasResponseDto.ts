import { ApiProperty } from '@nestjs/swagger';

export class CantidadNoLeidasResponseDto {
  @ApiProperty({
    example: 3,
    description: 'Cantidad de notificaciones no leídas del usuario autenticado',
  })
  cantidad!: number;
}
