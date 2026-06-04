import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';
import Usuario_Service from '../service/usuario.service';
import { JWT_SECRET } from './auth.constants';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly service = new Usuario_Service();

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token de autenticación faltante');
    }

    const token = authHeader.replace('Bearer ', '').trim();

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: number;
        correo: string;
        rol: string;
      };

      const usuario = await this.service.obtenerUsuarioPorId(decoded.id);
      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const requestWithUser = request as Request & { user?: unknown };
      requestWithUser.user = usuario;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
