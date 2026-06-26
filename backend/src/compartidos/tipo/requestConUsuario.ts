import { Request } from 'express';
import Usuario from '../../usuario/entity/usuarioEntity';

/**
 * Extiende la solicitud HTTP de Express para incluir el usuario autenticado.
 *
 * Este tipo se utiliza de forma compartida por guards y controllers que
 * necesitan acceder a la identidad del usuario disponible en el request.
 */
export type RequestConUsuario = Request & {
  user: Usuario;
};
