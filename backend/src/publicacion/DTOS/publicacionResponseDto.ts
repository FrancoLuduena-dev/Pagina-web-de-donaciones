export class PublicacionResponseDto {
  id!: string;
  titulo!: string;
  descripcion!: string;
  categoriaId!: string;
  localidadId!: string;
  condicion!: string;
  imagenUrls!: string[];
  estado!: string;
  creadorId!: string;
  creadorNombreUsuario!: string;
  creadorNombreCompleto!: string;
  createdAt!: Date;
}
