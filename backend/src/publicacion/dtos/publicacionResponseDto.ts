import { ApiProperty } from '@nestjs/swagger';

export class PublicacionResponseDto {
  @ApiProperty({
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
    description: 'ID de la publicación',
  })
  id!: string;

  @ApiProperty({
    example: 'Campera de abrigo para niño',
    description: 'Título de la publicación',
  })
  titulo!: string;

  @ApiProperty({
    example:
      'Campera en buen estado, sin roturas, ideal para temporada de invierno.',
    description: 'Descripción de la publicación',
  })
  descripcion!: string;

  @ApiProperty({
    example: 'c1c2c3c4-1111-2222-3333-444455556666',
    description: 'ID de la categoría',
  })
  categoriaId!: string;

  @ApiProperty({
    example: 'a1a2a3a4-1111-2222-3333-444455556666',
    description: 'ID de la localidad',
  })
  localidadId!: string;

  @ApiProperty({
    example: 'BUENO',
    description: 'Condición del objeto publicado',
  })
  condicion!: string;

  @ApiProperty({
    example: ['/uploads/publicaciones/imagen-123.jpg'],
    description: 'URLs de las imágenes de la publicación',
    type: [String],
  })
  imagenUrls!: string[];

  @ApiProperty({
    example: 'DISPONIBLE',
    description: 'Estado actual de la publicación',
  })
  estado!: string;

  @ApiProperty({
    example: 'd1d2d3d4-1111-2222-3333-444455556666',
    description: 'ID del usuario creador de la publicación',
  })
  creadorId!: string;

  @ApiProperty({
    example: 'meli.qa',
    description: 'Nombre de usuario del creador',
  })
  creadorNombreUsuario!: string;

  @ApiProperty({
    example: 'Melina De Marte',
    description: 'Nombre completo del creador',
  })
  creadorNombreCompleto!: string;

  @ApiProperty({
    example: '2026-06-24T22:30:00.000Z',
    description: 'Fecha de creación de la publicación',
  })
  createdAt!: Date;
}
