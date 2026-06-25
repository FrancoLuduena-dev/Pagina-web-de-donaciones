import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { MotivoDenuncia } from '../enums/motivoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';

export class DenunciaResponseDto {
  @ApiProperty({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la denuncia',
  })
  id!: string;

  @ApiProperty({
    example: 'a1a2a3a4-1111-2222-3333-444455556666',
    description: 'ID de la publicación denunciada',
  })
  publicacionId!: string;

  @ApiProperty({
    example: 'c1c2c3c4-1111-2222-3333-444455556666',
    description: 'ID del usuario que realizó la denuncia',
  })
  denuncianteId!: string;

  @ApiProperty({
    example: 'd1d2d3d4-1111-2222-3333-444455556666',
    description: 'ID del usuario creador de la publicación denunciada',
  })
  creadorPublicacionId!: string;

  @ApiPropertyOptional({
    example: 'e1e2e3e4-1111-2222-3333-444455556666',
    description: 'ID del moderador asignado a la denuncia',
    nullable: true,
  })
  moderadorAsignadoId?: string | null;

  @ApiProperty({
    enum: MotivoDenuncia,
    example: MotivoDenuncia.PUBLICACION_FALSA,
    description: 'Motivo de la denuncia',
  })
  motivo!: MotivoDenuncia;

  @ApiPropertyOptional({
    example: 'La publicación contiene información falsa o engañosa.',
    description: 'Comentario adicional cargado por el denunciante',
    nullable: true,
  })
  comentario?: string | null;

  @ApiProperty({
    enum: EstadoDenuncia,
    example: EstadoDenuncia.PENDIENTE,
    description: 'Estado actual de la denuncia',
  })
  estado!: EstadoDenuncia;

  @ApiPropertyOptional({
    enum: TipoResolucion,
    example: TipoResolucion.PUBLICACION_PAUSADA,
    description: 'Tipo de resolución aplicada',
    nullable: true,
  })
  tipoResolucion?: TipoResolucion | null;

  @ApiProperty({
    example: '2026-06-24T22:30:00.000Z',
    description: 'Fecha de creación de la denuncia',
  })
  fechaCreacion!: Date;

  @ApiProperty({
    example: '2026-06-24T22:45:00.000Z',
    description: 'Fecha de última actualización de la denuncia',
  })
  fechaActualizacion!: Date;

  @ApiProperty({
    example: 1,
    description:
      'Versión actual de la denuncia. Se utiliza para control de concurrencia.',
  })
  version!: number;
}
