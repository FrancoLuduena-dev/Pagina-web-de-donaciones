import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';

import Usuario from '../entity/usuarioEntity';
import autenticacionUsuario from './authUsuario';

type RequestConUsuario = Request & {
  user?: Usuario;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authUsuario: autenticacionUsuario) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestConUsuario>();

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación faltante');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    const usuario = await this.authUsuario.validarToken(token);

    request.user = usuario;

    return true;
  }
}
