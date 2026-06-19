import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { sign, verify, Secret, SignOptions } from 'jsonwebtoken';

import Usuario_Service from '../service/usuarioService';
import Usuario from '../entity/usuarioEntity';

import crearUsuarioDTO from '../dtos/usuarioDto';
import logearUsuarioDTO from '../dtos/logearUsuarioDto';

import { JWT_SECRET, JWT_EXPIRATION } from './authConstants';

@Injectable()
export default class autenticacionUsuario {
  constructor(private readonly service: Usuario_Service) {}

  async registrarUsuario(usuario: crearUsuarioDTO): Promise<Omit<Usuario, 'contrasenia'>> {
    const hashedPassword = await bcrypt.hash(usuario.contrasenia, 10);

    const newUser = await this.service.CrearUsuario({
      ...usuario,
      contrasenia: hashedPassword,
    });

    if (!newUser) {
      throw new UnauthorizedException('Error al registrar el usuario');
    }

    const { contrasenia, ...usuarioSinContrasenia } = newUser;
    return usuarioSinContrasenia;
  }

  public async logearUsuario(datos: logearUsuarioDTO): Promise<string> {
    const usuario = await this.service.ObtenerUsuarioPorCorreo(
      datos.correo,
    );

    if (!usuario) {
      throw new UnauthorizedException('Correo o contrasenia incorrectos');
    }

    const isValid = await bcrypt.compare(
      datos.contrasenia,
      usuario.contrasenia,
    );

    if (!isValid) {
      throw new UnauthorizedException('Correo o contrasenia incorrectos');
    }

    const secret: Secret = JWT_SECRET;

    const options: SignOptions = {
      expiresIn: JWT_EXPIRATION as SignOptions['expiresIn'],
    };

    return sign(
      {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
      },
      secret,
      options,
    );
  }

  public async validarToken(token: string): Promise<Usuario> {
    try {
      const decoded = verify(token, JWT_SECRET) as { id: string };

      const usuario = await this.service.obtenerUsuarioPorId(decoded.id);

      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      return usuario;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
