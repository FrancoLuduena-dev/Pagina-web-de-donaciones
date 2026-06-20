export type PublicacionBackend = {
  id: string;
  titulo: string;
  descripcion: string;
  categoriaId: string;
  localidadId: string;
  condicion: string;
  imagenUrls: string[];
  estado: string;
  creadorId: string;
  creadorNombreUsuario?: string;
  creadorNombreCompleto?: string;
};

export type CrearPublicacionPayload = {
  titulo: string;
  descripcion: string;
  categoriaId: string;
  localidadId: string;
  condicion: string;
  imagenUrls: string[];
};

export type EditarPublicacionPayload = Partial<CrearPublicacionPayload>;
