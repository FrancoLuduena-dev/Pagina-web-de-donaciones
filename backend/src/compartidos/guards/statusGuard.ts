import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { estadosUsuario } from '../../usuario/enums/estadosUsuario';
import { ESTADOS_KEY } from 'src/compartidos/decorators/decoratorEstados';

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

        return StatusRequeridos.includes(user.estado);
    }
}