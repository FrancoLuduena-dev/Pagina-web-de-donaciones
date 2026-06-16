import { CategoriaPublicacion } from "@/types/CategoriaPublicacion";
import { EstadoDonacion } from "@/types/EstadoDonacion";
import { EstadoPublicacion } from "@/types/EstadoPublicacion";
import type { PublicacionResumen } from "@/types/PublicacionResumen";
import type { PublicacionBackend } from "@/types/PublicacionBackend";
import { labelCategoria } from "@/lib/publicacionLabels";

/** UUIDs temporales hasta que el backend exponga categorías y localidades reales. */
export const CATEGORIA_IDS: Record<CategoriaPublicacion, string> = {
  [CategoriaPublicacion.INDUMENTARIA]: "550e8400-e29b-41d4-a716-446655440001",
  [CategoriaPublicacion.MUEBLES]: "550e8400-e29b-41d4-a716-446655440002",
  [CategoriaPublicacion.ALIMENTOS]: "550e8400-e29b-41d4-a716-446655440003",
  [CategoriaPublicacion.OTROS]: "550e8400-e29b-41d4-a716-446655440004",
};

export const LOCALIDAD_ID_DEFAULT = "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d";

export const CONDICIONES_OBJETO = [
  { value: "NUEVO", label: "Nuevo" },
  { value: "USADO_BUENO", label: "Usado (buen estado)" },
  { value: "USADO_REGULAR", label: "Usado (estado regular)" },
] as const;

export type CondicionObjeto = (typeof CONDICIONES_OBJETO)[number]["value"];

export const ESTADO_PUBLICACION_LABELS: Record<string, string> = {
  DISPONIBLE: "Disponible",
  RESERVADA: "Reservada",
  ENTREGADA: "Entregada",
  PAUSADA: "Pausada",
  ELIMINADA: "Eliminada",
};

const ESTADO_BACKEND_A_FRONT: Record<string, EstadoPublicacion> = {
  DISPONIBLE: EstadoPublicacion.DISPONIBLE,
  RESERVADA: EstadoPublicacion.RESERVADO,
  ENTREGADA: EstadoPublicacion.ENTREGADO,
  PAUSADA: EstadoPublicacion.PAUSADO,
  ELIMINADA: EstadoPublicacion.ELIMINADO,
};

export function categoriaIdToEnum(categoriaId: string): CategoriaPublicacion {
  const entry = Object.entries(CATEGORIA_IDS).find(([, id]) => id === categoriaId);
  return (entry?.[0] as CategoriaPublicacion) ?? CategoriaPublicacion.OTROS;
}

export function labelCategoriaId(categoriaId: string): string {
  return labelCategoria(categoriaIdToEnum(categoriaId));
}

export function labelCondicion(condicion: string): string {
  return (
    CONDICIONES_OBJETO.find((item) => item.value === condicion)?.label ?? condicion
  );
}

export function labelEstadoPublicacionBackend(estado: string): string {
  return ESTADO_PUBLICACION_LABELS[estado] ?? estado;
}

export function mapPublicacionBackendToResumen(
  publicacion: PublicacionBackend,
): PublicacionResumen {
  return {
    idPublicacion: publicacion.id,
    tituloPublicacion: publicacion.titulo,
    descripcionPublicacion: publicacion.descripcion,
    urlFoto: publicacion.imagenUrl,
    categoria: categoriaIdToEnum(publicacion.categoriaId),
    zonaRetiro: "Localidad por definir",
    estadoPublicacion:
      ESTADO_BACKEND_A_FRONT[publicacion.estado] ?? EstadoPublicacion.DISPONIBLE,
    estadoDonacion:
      publicacion.condicion === "NUEVO"
        ? EstadoDonacion.NUEVO
        : EstadoDonacion.USADO,
  };
}
