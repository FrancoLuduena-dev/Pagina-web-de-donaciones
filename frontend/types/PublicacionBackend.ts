export type PublicacionBackend = {
  id: string;
  titulo: string;
  descripcion: string;
  categoriaId: string;
  localidadId: string;
  condicion: string;
  imagenUrl: string;
  estado: string;
  creadorId: string;
};

export type CrearPublicacionPayload = {
  titulo: string;
  descripcion: string;
  categoriaId: string;
  localidadId: string;
  condicion: string;
  imagenUrl: string;
};

export type EditarPublicacionPayload = Partial<CrearPublicacionPayload>;
