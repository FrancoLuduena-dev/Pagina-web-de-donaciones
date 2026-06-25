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

/**
 * Guard que valida si el usuario autenticado posee alguno de los roles requeridos.
 *
 * Se utiliza como capa previa de autorización antes de ejecutar un controller o handler.
 * Lee los roles declarados mediante el decorador Roles y los compara con el rol del usuario.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Evalúa si el usuario puede acceder a la ruta actual.
   *
   * Si no hay roles requeridos declarados, permite continuar. En caso contrario,
   * exige que exista un usuario autenticado y que su rol sea uno de los permitidos.
   *
   * @param context Contexto de ejecución de NestJS.
   * @returns true cuando el acceso está permitido.
   * @throws UnauthorizedException Si no existe un usuario autenticado.
   * @throws ForbiddenException Si el rol del usuario no coincide con los roles permitidos.
   */
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
