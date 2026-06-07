import { CategoriaPublicacion } from "./CategoriaPublicacion";
import { EstadoDonacion } from "./EstadoDonacion";
import { EstadoPublicacion } from "./EstadoPublicacion";

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
