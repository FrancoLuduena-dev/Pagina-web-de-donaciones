import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import Usuario from 'src/usuario/entity/usuarioEntity';
import { estadosUsuario } from 'src/usuario/enums/estadosUsuario';

type RequestConUsuario = Request & {
  user?: Usuario;
};

@Injectable()
export class StatusGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    const usuario = request.user;

    if (!usuario) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    if (usuario.estado === estadosUsuario.BLOQUEADO) {
      throw new ForbiddenException('USUARIO_BLOQUEADO');
    }

    return true;
  }
}
