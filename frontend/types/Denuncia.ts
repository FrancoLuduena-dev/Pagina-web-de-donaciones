export type Denuncia = {
  id: string;

  publicacionId: string;
  denuncianteId: string;
  creadorPublicacionId: string;
  moderadorAsignadoId?: string | null;

  motivo: string;
  comentario?: string | null;

  estado: string;
  tipoResolucion?: string | null;

  fechaCreacion: string;
  fechaActualizacion: string;

  version: number;
};