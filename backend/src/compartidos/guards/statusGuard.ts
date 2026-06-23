import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { estadosUsuario } from '../../usuario/enums/estadosUsuario';
import { ESTADOS_KEY } from 'src/compartidos/decorators/decoratorEstados';
import { UnauthorizedException } from '@nestjs/common';
import { ForbiddenException } from '@nestjs/common';

interface RequestConUsuario extends Request {
    user: {
        estado: estadosUsuario;
    };
}

@Injectable()
export class StatusGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const StatusRequeridos = this.reflector.getAllAndOverride<estadosUsuario[]>(
            ESTADOS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!StatusRequeridos) {
            return true;
        }

        

        const request = context.switchToHttp().getRequest<RequestConUsuario>();

        const user = request.user;

      if (!user) {
        throw new UnauthorizedException('Usuario no autenticado');
      }

      if (!StatusRequeridos.includes(user.estado)) {
        throw new ForbiddenException('Estado de usuario no permitido');
      }

        return StatusRequeridos.includes(user.estado);
    }
}
