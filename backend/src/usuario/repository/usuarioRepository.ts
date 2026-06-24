import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import Usuario from '../entity/usuarioEntity';
import { rolUsuario } from '../enums/rolUsuario';
import { estadosUsuario } from '../enums/estadosUsuario';

@Injectable()
export default class UsuarioRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>,
  ) {}

  async crearUsuario(datos: Partial<Usuario>): Promise<Usuario> {
    const nuevoUsuario = this.repository.create(datos);
    return this.repository.save(nuevoUsuario);
  }

  async eliminarUsuario(idUsuario: string): Promise<void> {
    await this.repository.delete({ id: idUsuario });
  }

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.repository.findOneBy({ id });
  }

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.repository.findOneBy({ correo: email });
  }

  async buscarPorEmailConContrasenia(email: string): Promise<Usuario | null> {
    return this.repository
      .createQueryBuilder('usuario')
      .addSelect('usuario.contrasenia')
      .where('usuario.correo = :email', { email })
      .getOne();
  }

  async buscarPorUsername(nombreUsuario: string): Promise<Usuario | null> {
    return this.repository.findOneBy({ nombreUsuario });
  }

  async buscarPorIdConContrasenia(id: string): Promise<Usuario | null> {
    return this.repository
      .createQueryBuilder('usuario')
      .addSelect('usuario.contrasenia')
      .where('usuario.id = :id', { id })
      .getOne();
  }

  async actualizarUsuario(
    idUsuario: string,
    nuevosDatos: Partial<Usuario>,
  ): Promise<void> {
    await this.repository.update({ id: idUsuario }, nuevosDatos);
  }

  async cambiarRolUsuario(
    idUsuario: string,
    nuevoRol: rolUsuario,
  ): Promise<void> {
    await this.repository.update({ id: idUsuario }, { rol: nuevoRol });
  }

  async cambiarEstadoUsuario(
    idUsuario: string,
    nuevoEstado: estadosUsuario,
  ): Promise<void> {
    await this.repository.update({ id: idUsuario }, { estado: nuevoEstado });
  }

  async resetearContraseniaUsuario(
    idUsuario: string,
    nuevacontrasenia: string,
  ): Promise<void> {
    await this.repository.update(
      { id: idUsuario },
      { contrasenia: nuevacontrasenia },
    );
  }

  async bloquearUsuario(
    usuario: Usuario,
    bloqueador: Usuario,
    razonBloqueo: string,
  ): Promise<void> {
    usuario.estado = estadosUsuario.BLOQUEADO;
    usuario.bloqueador = bloqueador;
    usuario.razonBloqueo = razonBloqueo;

    await this.repository.save(usuario);
  }

  async listarUsuarios(): Promise<Usuario[]> {
    return this.repository.find();
  }
}
