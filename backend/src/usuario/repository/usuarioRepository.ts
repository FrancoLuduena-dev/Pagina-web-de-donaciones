import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import Usuario from '../entity/usuarioEntity';
import { rolUsuario } from '../enums/rolUsuario';
import { estadosUsuario } from '../enums/estadosUsuario';

/** * Repositorio encargado del acceso a datos de la entidad Usuario. * 
 * * Este nivel SOLO se encarga de interactuar con la base de datos. * 
 * No contiene lógica de negocio (eso vive en el service). */

@Injectable()
export default class UsuarioRepository {
  constructor(
    @InjectRepository(Usuario)
    private readonly repository: Repository<Usuario>,
  ) {}

  /** * Crea y persiste un nuevo usuario. * * 
   * @param datos Datos parciales del usuario * 
   * @returns Usuario creado */

  async crearUsuario(datos: Partial<Usuario>): Promise<Usuario> {
    const nuevoUsuario = this.repository.create(datos);
    return this.repository.save(nuevoUsuario);
  }

  /** * Elimina un usuario por ID. * * 
   * @param idUsuario ID del usuario */

  async eliminarUsuario(idUsuario: string): Promise<void> {
    await this.repository.delete({ id: idUsuario });
  }

  /** * Busca un usuario por ID. * * 
   * @param id ID del usuario * 
   * @returns Usuario o null si no existe */

  async buscarPorId(id: string): Promise<Usuario | null> {
    return this.repository.findOneBy({ id });
  }

  /** * Busca un usuario por correo electrónico. * * 
   * @param email correo del usuario * 
   * @returns Usuario o null si no existe */

  async buscarPorEmail(email: string): Promise<Usuario | null> {
    return this.repository.findOneBy({ correo: email });
  }

  /** * Busca un usuario por correo incluyendo la contraseña. * *  
   * IMPORTANTE: * La contraseña normalmente está excluida por seguridad, 
   * * por lo que se usa QueryBuilder para incluirla explícitamente. * * 
   * @param email correo del usuario * 
   * @returns Usuario con contraseña o null */

  async buscarPorEmailConContrasenia(email: string): Promise<Usuario | null> {
    return this.repository
      .createQueryBuilder('usuario')
      .addSelect('usuario.contrasenia')
      .where('usuario.correo = :email', { email })
      .getOne();
  }

  /** * Busca un usuario por nombre de usuario. * * 
   * @param nombreUsuario username * 
   * @returns Usuario o null si no existe */

  async buscarPorUsername(nombreUsuario: string): Promise<Usuario | null> {
    return this.repository.findOneBy({ nombreUsuario });
  }

  /** * Busca un usuario por ID incluyendo la contraseña. * * 
   * @param id ID del usuario * 
   * @returns Usuario con contraseña o null */

  async buscarPorIdConContrasenia(id: string): Promise<Usuario | null> {
    return this.repository
      .createQueryBuilder('usuario')
      .addSelect('usuario.contrasenia')
      .where('usuario.id = :id', { id })
      .getOne();
  }

  /** * Actualiza parcialmente un usuario. * * 
   * @param idUsuario ID del usuario * 
   * @param nuevosDatos datos a actualizar */

  async actualizarUsuario(
    idUsuario: string,
    nuevosDatos: Partial<Usuario>,
  ): Promise<void> {
    await this.repository.update({ id: idUsuario }, nuevosDatos);
  }

  /** * Cambia el rol de un usuario. * * 
   * @param idUsuario ID del usuario * 
   * @param nuevoRol nuevo rol asignado */

  async cambiarRolUsuario(
    idUsuario: string,
    nuevoRol: rolUsuario,
  ): Promise<void> {
    await this.repository.update({ id: idUsuario }, { rol: nuevoRol });
  }

  /** * Cambia el estado de un usuario (activo, bloqueado). * * 
   * @param idUsuario ID del usuario * 
   * @param nuevoEstado nuevo estado del usuario */

  async cambiarEstadoUsuario(
    idUsuario: string,
    nuevoEstado: estadosUsuario,
  ): Promise<void> {
    await this.repository.update({ id: idUsuario }, { estado: nuevoEstado });
  }

  /** * Actualiza la contraseña de un usuario. * * 
   *  Se espera que la contraseña ya esté hasheada. * * 
   * @param idUsuario ID del usuario * 
   * @param nuevacontrasenia contraseña hasheada */

  async resetearContraseniaUsuario(
    idUsuario: string,
    nuevacontrasenia: string,
  ): Promise<void> {
    await this.repository.update(
      { id: idUsuario },
      { contrasenia: nuevacontrasenia },
    );
  }

  /** * Bloquea un usuario. * * 
   * Reglas aplicadas en el service: * 
   * - Validación de permisos * 
   * - Validación de estado * * 
   * Este método solo persiste los cambios. * * 
   * @param usuario entidad usuario a modificar * 
   * @param bloqueador usuario que realiza el bloqueo * 
   * @param razonBloqueo motivo del bloqueo */

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

  /** * Obtiene todos los usuarios. * * 
   * @returns lista de usuarios */

  async listarUsuarios(): Promise<Usuario[]> {
    return this.repository.find();
  }
}
