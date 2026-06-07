import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Usuario from '../models/usuario.entity';
import CrearUsuarioDTO from "../dtos/usuario.dto";
import { AppDataSource } from '../..';
import UsuarioRepository from '../repository/usuario.repository';
import { rolUsuario } from '../enums/rolUsuario.enum';
import actualizarUsuarioDTO from '../dtos/update.usuario.dto';
import { CambiarRolDTO } from '../dtos/cambiarRol.dto';
import { BloquearUsuarioDTO } from '../dtos/bloquearUsuario.dto';
import bcrypt from 'bcrypt';

export default class Usuario_Service {
    private repo = new UsuarioRepository();

    /*

 to do: ver especificamente las excepciones en base a que error salio en la ejecucion de cada metodo.
        tal vez crear excepciones personalizadas para cada caso.
     */


    public async CrearUsuario(usuario: CrearUsuarioDTO): Promise<Usuario> {
        /*
        validar nombre usuario unico
        validar correo unico
        validar formato de correo
    
        */
        // Validar correo único
        const existeCorreo = await this.repo.buscarPorEmail(usuario.correo);
        if (existeCorreo) throw new ConflictException('El correo ya está registrado');

        // Validar username único
        const existeUser = await this.repo.buscarPorUsername(usuario.nombreUsuario);
        if (existeUser) throw new ConflictException('El nombre de usuario ya existe');

        return await this.repo.crearUsuario(usuario);
    }

public async EliminarUsuario(id_usuario: number, contraseña: string): Promise<void> {
    /* validar que el usuario exista */
    /* pedirle que confirme la contraseña al usuario*/ 
    const usuario = await this.obtenerUsuarioPorId(id_usuario);
    if (!usuario) { 
        throw new ConflictException(`Usuario con id ${id_usuario} no encontrado`);
    }

    const isValid = await bcrypt.compare(contraseña, usuario.contraseña);
    if (!isValid) {
        throw new ConflictException('La contraseña es incorrecta');
    }

    await this.repo.eliminarUsuario(id_usuario);
}

public async EliminarUsuarioAdmin(id_usuario: number, id_admin: number): Promise<void> { 
    /* validar que el usuario exista */
    const usuario = await this.obtenerUsuarioPorId(id_usuario);
    const usuarioAdmin = await this.obtenerUsuarioPorId(id_admin);
    if (!usuario) { 
        throw new ConflictException(`Usuario con id ${id_usuario} no encontrado`);
    }

    if (!usuarioAdmin) {
        throw new ConflictException(`Admin con id ${id_admin} no encontrado`);
    }

    await this.repo.eliminarUsuario(id_usuario);

}

public async ActualizarUsuario(id_usuario: number, datos: actualizarUsuarioDTO): Promise<void> {
    /*
    validar que el usuario exista
    validar que el correo sea unico si se esta actualizando
    validar que el nombre de usuario sea unico si se esta actualizando
    
    */ 
   const usuario = await this.obtenerUsuarioPorId(id_usuario);
   
   if (!usuario) {
       throw new Error(`Usuario con id ${id_usuario} no encontrado`);
   }

   const existeCorreo = await this.repo.buscarPorEmail(usuario.correo);
   if (existeCorreo) throw new ConflictException('El correo ya está registrado en la base de datos');

   if (usuario.correo === datos.correo) { 
       throw new ConflictException(`El correo que intenta actualizar ya es el correo actual del usuario`);
   }

    const existeUser = await this.repo.buscarPorUsername(usuario.nombreUsuario);
    if (existeUser) throw new ConflictException('El nombre de usuario ya existe en la base de datos');

    if (usuario.nombreUsuario === datos.nombreUsuario) { 
        throw new ConflictException(`El nombre de usuario que intenta actualizar ya es el nombre de usuario actual del usuario`);
    }

    await this.repo.actualizarUsuario(id_usuario, datos);
}

public async obtenerUsuarioPorId(id_usuario: number): Promise<Usuario | null> {
    const usuario = await this.repo.buscarPorId(id_usuario);
    if (!usuario) {
        throw new Error(`Usuario con id ${id_usuario} no encontrado`);
    }
    return await this.repo.buscarPorId(id_usuario);
}

public async ObtenerUsuarioPorNombreUsuario(nombreUsuario: string): Promise<Usuario | null> {
    return await this.repo.buscarPorUsername(nombreUsuario);
}

public async ObtenerUsuarioPorCorreo(correo: string): Promise<Usuario | null> {
    return await this.repo.buscarPorEmail(correo);
}

public async CambiarRolUsuario(id_usuario: number, id_admin: number, datos: CambiarRolDTO): Promise<void> {
    /* verfifcar que el usuario tenga rol admin
    validar que el rol actual no sea el de admin  
    */ 
    const usuario = await this.obtenerUsuarioPorId(id_usuario);
    const usuarioAdmin = await this.obtenerUsuarioPorId(id_admin);

    if (!usuario) {
        throw new ConflictException(`Usuario con id ${id_usuario} no encontrado`);
    }

    if (!usuarioAdmin) {
        throw new ConflictException(`Admin con id ${id_admin} no encontrado`);
    }

    await this.repo.cambiarRolUsuario(id_usuario, datos.rol);
}

public async ResetearContraseñaUsuario(id_usuario: number, contraseña_actual: string, contraseña_nueva: string): Promise<void> { 
    /* verfifcar que el usuario exista 
    verificar que la contraseña actual sea correcta
    validar que la contraseña nueva no sea igual a la actual
    */ 
    const usuario = await this.obtenerUsuarioPorId(id_usuario);
    if (!usuario) { throw new ConflictException(`Usuario con id ${id_usuario} no encontrado`); }

    if (usuario.contraseña !== contraseña_actual) {
        throw new ConflictException('La contraseña actual es incorrecta');
    }

    if (usuario.contraseña === contraseña_nueva) {
        throw new ConflictException('La nueva contraseña no puede ser igual a la contraseña actual');
    }

    await this.repo.resetearContraseñaUsuario(id_usuario, contraseña_nueva);

}

public async BloquearUsuario(id_usuario: number, id_moderador: number, datos: BloquearUsuarioDTO): Promise<void> {
    /* verfifcar que el usuario tenga rol mod o admin
    verificar que el usuario bloqueador no sea el mismo que el bloqueado
    validar que el usuario bloqueado no este ya bloqueado
    validar que la razon de bloqueo no este vacia
    */
    const usuario = await this.obtenerUsuarioPorId(id_usuario);
    if (!usuario) { throw new ConflictException(`Usuario con id ${id_usuario} no encontrado`); }
    const usuarioModerador = await this.obtenerUsuarioPorId(id_moderador);
    if (!usuarioModerador) { throw new ConflictException(`Usuario moderador con id ${id_moderador} no encontrado`); }

    if (usuario.estado === 'BLOQUEADO') {
        throw new ConflictException(`El usuario con id ${id_usuario} ya se encuentra bloqueado`);
    }

    if (datos.razonBloqueo === null || datos.razonBloqueo === '') {
        throw new ConflictException(`La razón de bloqueo no puede estar vacía`);
    }

    await this.repo.bloquearUsuario(id_usuario, id_moderador, datos.razonBloqueo);
}

public async ListarUsuarios(): Promise<Array<Usuario>> {
    return await this.repo.listarUsuarios();
}

}