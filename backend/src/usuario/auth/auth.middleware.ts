import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import Usuario_Service from '../service/usuario.service';
import { JWT_SECRET } from './auth.constants';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly service = new Usuario_Service();

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;
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

      const reqWithUser = req as Request & { user?: unknown };
      reqWithUser.user = usuario;
      next();
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
