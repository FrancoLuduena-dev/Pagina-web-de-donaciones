import { Publicacion } from '../entities/publicacionEntity';

export interface IEstadoPublicacion {
  nombre: string;

  reservar(publicacion: Publicacion): void;
  pausar(publicacion: Publicacion): void;
  entregar(publicacion: Publicacion, actorId: string): void;
  reactivar(publicacion: Publicacion): void;
  eliminar(publicacion: Publicacion): void;
}
