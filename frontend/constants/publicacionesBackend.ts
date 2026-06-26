import { CategoriaPublicacion } from "@/types/CategoriaPublicacion";
import { EstadoDonacion } from "@/types/EstadoDonacion";
import { EstadoPublicacion } from "@/types/EstadoPublicacion";
import type { PublicacionResumen } from "@/types/PublicacionResumen";
import type { PublicacionBackend } from "@/types/PublicacionBackend";
import { labelCategoria } from "@/lib/publicacionLabels";
import {
  LOCALIDAD_ID_DEFAULT,
  zonaRetiroDesdeLocalidadId,
} from "@/constants/localidadesVicenteLopez";

export { LOCALIDAD_ID_DEFAULT };

/** UUIDs temporales hasta que el backend exponga categorías reales. */
export const CATEGORIA_IDS: Record<CategoriaPublicacion, string> = {
  [CategoriaPublicacion.INDUMENTARIA]: "550e8400-e29b-41d4-a716-446655440001",
  [CategoriaPublicacion.MUEBLES]: "550e8400-e29b-41d4-a716-446655440002",
  [CategoriaPublicacion.ALIMENTOS]: "550e8400-e29b-41d4-a716-446655440003",
  [CategoriaPublicacion.OTROS]: "550e8400-e29b-41d4-a716-446655440004",
};

/** Cantidad máxima de imágenes permitidas por publicación. */
export const MAX_IMAGENES_PUBLICACION = 5;

/**
 * Obtiene las URLs de imagen de una publicación de forma segura.
 *
 * @param publicacion Publicación con posibles imágenes.
 * @returns Lista de URLs de imagen, o un arreglo vacío si no hay.
 */
export function getImagenesPublicacion(publicacion: {
  imagenUrls?: string[];
}): string[] {
  return publicacion.imagenUrls ?? [];
}

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

/**
 * Convierte el UUID de categoría del backend a su enum de frontend.
 *
 * @param categoriaId UUID de categoría proveniente del backend.
 * @returns Categoría correspondiente, o `OTROS` si no hay coincidencia.
 */
export function categoriaIdToEnum(categoriaId: string): CategoriaPublicacion {
  const entry = Object.entries(CATEGORIA_IDS).find(([, id]) => id === categoriaId);
  return (entry?.[0] as CategoriaPublicacion) ?? CategoriaPublicacion.OTROS;
}

/**
 * Devuelve la etiqueta legible de una categoría a partir de su UUID.
 *
 * @param categoriaId UUID de categoría proveniente del backend.
 * @returns Etiqueta legible de la categoría.
 */
export function labelCategoriaId(categoriaId: string): string {
  return labelCategoria(categoriaIdToEnum(categoriaId));
}

/**
 * Devuelve la etiqueta legible de una condición de objeto.
 *
 * @param condicion Valor de condición (ej. `USADO_BUENO`).
 * @returns Etiqueta legible, o el valor original si no se reconoce.
 */
export function labelCondicion(condicion: string): string {
  return (
    CONDICIONES_OBJETO.find((item) => item.value === condicion)?.label ?? condicion
  );
}

/**
 * Devuelve la etiqueta legible de un estado de publicación del backend.
 *
 * @param estado Estado de publicación (ej. `PAUSADA`).
 * @returns Etiqueta legible, o el valor original si no se reconoce.
 */
export function labelEstadoPublicacionBackend(estado: string): string {
  return ESTADO_PUBLICACION_LABELS[estado] ?? estado;
}

export { labelLocalidadId, zonaRetiroDesdeLocalidadId } from "@/constants/localidadesVicenteLopez";

/**
 * Mapea una publicación del backend al resumen usado por la UI.
 *
 * Traduce identificadores y enums del backend (categoría, estado, condición y
 * localidad) a los valores y etiquetas que consumen los componentes de listado.
 *
 * @param publicacion Publicación tal como la devuelve el backend.
 * @returns Resumen de publicación listo para mostrar en la interfaz.
 */
export function mapPublicacionBackendToResumen(
  publicacion: PublicacionBackend,
): PublicacionResumen {
  return {
    idPublicacion: publicacion.id,
    tituloPublicacion: publicacion.titulo,
    descripcionPublicacion: publicacion.descripcion,
    urlFoto: getImagenesPublicacion(publicacion)[0] ?? "",
    categoria: categoriaIdToEnum(publicacion.categoriaId),
    zonaRetiro: zonaRetiroDesdeLocalidadId(publicacion.localidadId),
    estadoPublicacion:
      ESTADO_BACKEND_A_FRONT[publicacion.estado] ?? EstadoPublicacion.DISPONIBLE,
    estadoDonacion:
      publicacion.condicion === "NUEVO"
        ? EstadoDonacion.NUEVO
        : EstadoDonacion.USADO,
  };
}
