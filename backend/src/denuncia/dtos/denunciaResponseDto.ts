import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { MotivoDenuncia } from '../enums/motivoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';

/**
 * Representación resumida de una denuncia para respuestas generales de la API.
 */
export class DenunciaResponseDto {
  /**
   * Identificador único de la denuncia.
   */
  @ApiProperty({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la denuncia',
  })
  id!: string;

  /**
   * Identificador de la publicación denunciada.
   */
  @ApiProperty({
    example: 'a1a2a3a4-1111-2222-3333-444455556666',
    description: 'ID de la publicación denunciada',
  })
  publicacionId!: string;

  /**
   * Identificador del usuario que realizó la denuncia.
   */
  @ApiProperty({
    example: 'c1c2c3c4-1111-2222-3333-444455556666',
    description: 'ID del usuario que realizó la denuncia',
  })
  denuncianteId!: string;

  /**
   * Identificador del creador de la publicación denunciada.
   */
  @ApiProperty({
    example: 'd1d2d3d4-1111-2222-3333-444455556666',
    description: 'ID del usuario creador de la publicación denunciada',
  })
  creadorPublicacionId!: string;

  /**
   * Identificador del moderador asignado, si corresponde.
   */
  @ApiPropertyOptional({
    example: 'e1e2e3e4-1111-2222-3333-444455556666',
    description: 'ID del moderador asignado a la denuncia',
    nullable: true,
  })
  moderadorAsignadoId?: string | null;

  /**
   * Motivo declarado para la denuncia.
   */
  @ApiProperty({
    enum: MotivoDenuncia,
    example: MotivoDenuncia.PUBLICACION_FALSA,
    description: 'Motivo de la denuncia',
  })
  motivo!: MotivoDenuncia;

  /**
   * Comentario opcional aportado por el denunciante.
   */
  @ApiPropertyOptional({
    example: 'La publicación contiene información falsa o engañosa.',
    description: 'Comentario adicional cargado por el denunciante',
    nullable: true,
  })
  comentario?: string | null;

  /**
   * Estado actual de la denuncia.
   */
  @ApiProperty({
    enum: EstadoDenuncia,
    example: EstadoDenuncia.PENDIENTE,
    description: 'Estado actual de la denuncia',
  })
  estado!: EstadoDenuncia;

  /**
   * Resolución aplicada, si la denuncia ya fue resuelta.
   */
  @ApiPropertyOptional({
    enum: TipoResolucion,
    example: TipoResolucion.PUBLICACION_PAUSADA,
    description: 'Tipo de resolución aplicada',
    nullable: true,
  })
  tipoResolucion?: TipoResolucion | null;

  /**
   * Fecha de creación de la denuncia.
   */
  @ApiProperty({
    example: '2026-06-24T22:30:00.000Z',
    description: 'Fecha de creación de la denuncia',
  })
  fechaCreacion!: Date;

  /**
   * Fecha de última actualización de la denuncia.
   */
  @ApiProperty({
    example: '2026-06-24T22:45:00.000Z',
    description: 'Fecha de última actualización de la denuncia',
  })
  fechaActualizacion!: Date;

  /**
   * Versión actual de la denuncia para control de concurrencia.
   */
  @ApiProperty({
    example: 1,
    description:
      'Versión actual de la denuncia. Se utiliza para control de concurrencia.',
  })
  version!: number;
}
