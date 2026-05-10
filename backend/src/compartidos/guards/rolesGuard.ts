import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { Reflector } from '@nestjs/core';
import { Rol } from '../enums';
import { ROLES_KEY } from '../decorators/decoratorRol';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.get<Rol[]>(
      ROLES_KEY,
      context.getHandler(),
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = context.switchToHttp().getRequest();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const rolUsuario = request.headers['rol'];

    console.log('ROL USUARIO:', rolUsuario);
    console.log('ROLES REQUERIDOS:', rolesRequeridos);

    if (!rolesRequeridos) {
      return true;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return rolesRequeridos.includes(rolUsuario);
  }
}
