import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { ESTADOS_KEY } from 'src/compartidos/decorators/decoratorEstados';
import { estadosUsuario } from 'src/usuario/enums/estadosUsuario';

interface RequestConUsuario extends Request {
  user?: {
    estado: estadosUsuario;
  };
}

@Injectable()
export class StatusGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const statusRequeridos = this.reflector.getAllAndOverride<estadosUsuario[]>(
      ESTADOS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!statusRequeridos || statusRequeridos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    if (!statusRequeridos.includes(user.estado)) {
      throw new ForbiddenException('Estado de usuario no permitido');
    }

    return true;
  }
}
