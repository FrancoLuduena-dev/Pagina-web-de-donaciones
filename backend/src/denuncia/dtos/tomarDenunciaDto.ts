import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class TomarDenunciaDto {
  @ApiProperty({
    example: 1,
    description:
      'Versión actual de la denuncia. Se usa para evitar conflictos de concurrencia.',
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  version!: number;
}
