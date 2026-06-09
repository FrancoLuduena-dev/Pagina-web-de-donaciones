import { CategoriaPublicacion } from "@/types/CategoriaPublicacion";
import { EstadoDonacion } from "@/types/EstadoDonacion";
import { EstadoPublicacion } from "@/types/EstadoPublicacion";

const categoriaLabels: Record<CategoriaPublicacion, string> = {
  [CategoriaPublicacion.INDUMENTARIA]: "Indumentaria",
  [CategoriaPublicacion.MUEBLES]: "Muebles",
  [CategoriaPublicacion.ALIMENTOS]: "Alimentos",
  [CategoriaPublicacion.OTROS]: "Otros",
};

const estadoPublicacionLabels: Record<EstadoPublicacion, string> = {
  [EstadoPublicacion.DISPONIBLE]: "Disponible",
  [EstadoPublicacion.RESERVADO]: "Reservada",
  [EstadoPublicacion.ENTREGADO]: "Entregada",
  [EstadoPublicacion.PAUSADO]: "Pausada",
  [EstadoPublicacion.ELIMINADO]: "Eliminada",
};

const estadoDonacionLabels: Record<EstadoDonacion, string> = {
  [EstadoDonacion.NUEVO]: "Nuevo",
  [EstadoDonacion.USADO]: "Usado",
};

export function labelCategoria(categoria: CategoriaPublicacion): string {
  return categoriaLabels[categoria];
}

export function labelEstadoPublicacion(estado: EstadoPublicacion): string {
  return estadoPublicacionLabels[estado];
}

export function labelEstadoDonacion(estado: EstadoDonacion): string {
  return estadoDonacionLabels[estado];
}
