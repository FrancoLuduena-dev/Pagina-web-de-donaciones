import { UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { sign, verify, Secret, SignOptions } from 'jsonwebtoken';
import Usuario_Service from '../service/usuario.service';
import Usuario from '../models/usuario.entity';
import crearUsuarioDTO from '../dtos/usuario.dto';
import logearUsuarioDTO from '../dtos/logearUsuario.dto';
import { JWT_SECRET, JWT_EXPIRATION } from './auth.constants';

export default class autenticacionUsuario {
  private readonly service = new Usuario_Service();

  async registrarUsuario(usuario: crearUsuarioDTO) {
    const hashedPassword = await bcrypt.hash(usuario.contraseña, 10);

    const newUser = await this.service.Crear_Usuario({
      ...usuario,
      contraseña: hashedPassword,
    });

    if (!newUser) {
      throw new UnauthorizedException('Error al registrar el usuario');
    }

    return newUser;
  }

  public async logearUsuario(datos: logearUsuarioDTO): Promise<string> {
    const usuario = await this.service.ObtenerUsuarioPorNombreUsuario(datos.nombreUsuario);
    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const isValid = await bcrypt.compare(datos.contraseña, usuario.contraseña);
    if (!isValid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const secret: Secret = JWT_SECRET;
    const options: SignOptions = {
      expiresIn: JWT_EXPIRATION as SignOptions['expiresIn'],
    };

    return sign(
      { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
      secret,
      options,
    );
  }

  public async validarToken(token: string): Promise<Usuario> {
    try {
      const decoded = verify(token, JWT_SECRET as Secret) as { id: number };
      const usuario = await this.service.obtenerUsuarioPorId(decoded.id);
      if (!usuario) {
        throw new UnauthorizedException('Usuario no encontrado');
      }
      return usuario;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
