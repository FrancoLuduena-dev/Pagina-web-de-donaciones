import { Request } from 'express';
import Usuario from '../../usuario/entity/usuarioEntity';

export type RequestConUsuario = Request & {
  user: Usuario;
};
