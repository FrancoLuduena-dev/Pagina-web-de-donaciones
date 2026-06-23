import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { ROLES_KEY } from 'src/compartidos/decorators/decoratorRol';
import Usuario from 'src/usuario/entity/usuarioEntity';
import { rolUsuario } from 'src/usuario/enums/rolUsuario';

type RequestConUsuario = Request & {
  user?: Usuario;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<rolUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rolesRequeridos || rolesRequeridos.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestConUsuario>();
    const usuario = request.user;

    if (!usuario) {
      throw new UnauthorizedException('Usuario no autenticado');
    }

    if (!rolesRequeridos.includes(usuario.rol)) {
      throw new ForbiddenException(
        'No tenés permisos para realizar esta acción',
      );
    }

    return true;
  }
}
