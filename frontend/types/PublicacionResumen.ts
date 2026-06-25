import { CategoriaPublicacion } from "./CategoriaPublicacion";
import { EstadoDonacion } from "./EstadoDonacion";
import { EstadoPublicacion } from "./EstadoPublicacion";

/**
 * Resumen de datos de una publicación para listados.
 */
export type PublicacionResumen = {
  idPublicacion: string;
  tituloPublicacion: string;
  descripcionPublicacion: string;
  urlFoto?: string;
  urlFotos?: string[];
  categoria: CategoriaPublicacion;
  zonaRetiro: string;
  estadoPublicacion: EstadoPublicacion;
  estadoDonacion: EstadoDonacion;
};
