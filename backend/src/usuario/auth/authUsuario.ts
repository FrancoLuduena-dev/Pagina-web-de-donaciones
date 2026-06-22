import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import { sign, SignOptions } from 'jsonwebtoken';

import Usuario_Service from '../service/usuarioService';

import crearUsuarioDTO from '../dtos/usuarioDto';
import logearUsuarioDTO from '../dtos/logearUsuarioDto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export default class autenticacionUsuario {
  constructor(
    private readonly service: Usuario_Service,
    private readonly config: ConfigService,
  ) {}

  async registrarUsuario(usuario: crearUsuarioDTO) {
    const hashedPassword = await bcrypt.hash(usuario.contrasenia, 10);

    const newUser = await this.service.CrearUsuario({
      ...usuario,
      contrasenia: hashedPassword,
    });

    if (!newUser) {
      throw new UnauthorizedException('Error al registrar el usuario');
    }

    return {
      message: 'Usuario registrado correctamente',
      user: {
        id: newUser.id,
        correo: newUser.correo,
        nombreUsuario: newUser.nombreUsuario,
      },
    };
  }

  public async logearUsuario(datos: logearUsuarioDTO): Promise<string> {
    const usuario = await this.service.ObtenerUsuarioPorCorreo(datos.correo);

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

    const secret = this.config.get<string>('JWT_SECRET');
    const expiration = this.config.get<string>('JWT_EXPIRATION') || '1h';

    if (!secret) {
      throw new InternalServerErrorException(
        'JWT no configurado en el servidor',
      );
    }

    const options: SignOptions = {
      expiresIn: expiration as SignOptions['expiresIn'],
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
}
