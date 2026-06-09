import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from './authRolesDecorator';
import { rolUsuario } from '../enums/rolUsuario';

interface RequestConUsuario extends Request {
  user: {
    rol: rolUsuario;
  };
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<rolUsuario[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!rolesRequeridos) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestConUsuario>();

    const user = request.user;

    return rolesRequeridos.includes(user.rol);
  }
}
