/**
 * Datos de una publicación recibida desde el backend.
 */
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

/**
 * Datos requeridos para crear una nueva publicación.
 */
export type CrearPublicacionPayload = {
  titulo: string;
  descripcion: string;
  categoriaId: string;
  localidadId: string;
  condicion: string;
  imagenUrls: string[];
};

/**
 * Payload para editar una publicación existente.
 */
export type EditarPublicacionPayload = Partial<CrearPublicacionPayload>;
