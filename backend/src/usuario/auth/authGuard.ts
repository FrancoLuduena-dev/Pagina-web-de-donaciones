import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';

import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import Usuario_Service from '../service/usuarioService';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly service: Usuario_Service,
    private readonly config: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación faltante');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    try {
      const secret = this.config.get<string>('JWT_SECRET');

      if (!secret) {
        throw new InternalServerErrorException('JWT no configurado en el servidor');
      }

      const decoded = jwt.verify(token, secret) as {
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
