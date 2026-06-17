import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import Usuario_Service from '../service/usuarioService';
import { JWT_SECRET } from './authConstants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly service: Usuario_Service) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación faltante');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        correo: string;
        rol: string;
      };

      const usuario = await this.service.obtenerUsuarioPorId(decoded.id);

      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const requestWithUser = request as Request & {
        user?: unknown;
      };

      requestWithUser.user = usuario;

      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
