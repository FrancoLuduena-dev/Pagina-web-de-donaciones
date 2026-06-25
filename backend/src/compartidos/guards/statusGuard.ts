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

/**
 * Guard que valida si el usuario autenticado cumple con los estados permitidos para operar.
 *
 * Actúa como una capa de control de acceso previa a la ejecución del endpoint,
 * consultando la metadata declarada mediante el decorador Estados.
 */
@Injectable()
export class StatusGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  /**
   * Evalúa si el usuario puede acceder a la ruta actual según su estado.
   *
   * Si no hay estados requeridos declarados, permite continuar. En caso contrario,
   * exige que exista un usuario autenticado y que su estado sea uno de los permitidos.
   *
   * @param context Contexto de ejecución de NestJS.
   * @returns true cuando el acceso está permitido.
   * @throws UnauthorizedException Si no existe un usuario autenticado.
   * @throws ForbiddenException Si el estado del usuario no coincide con los permitidos.
   */
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
