import { Usuario } from "../models/usuario.entity";
import { DataSource } from "typeorm";
import { AppDataSource } from "../index";
import { rolUsuario } from "../enums/rol_usuario.enum";
import { estadosUsuario } from "../enums/estados_usuario.enum";



const usuarioRepository = AppDataSource.getRepository(Usuario);

const usuario = new Usuario();

await usuarioRepository.save(usuario);

const listaUsuarios = await usuarioRepository.find();

async function eliminarUsuario(id_usuario: number): Promise<void> {
    const usuarioAEliminar = await usuarioRepository.findOneBy({ idUsuario: id_usuario });
    if (!usuarioAEliminar) { 
        throw new Error(`Usuario con id ${id_usuario} no encontrado`); 
    } else {
        await usuarioRepository.remove(usuarioAEliminar);
    }
}

async function actualizarUsuario(id_usuario: number, nuevosDatos: Partial<Usuario>): Promise<void> { 
    await usuarioRepository.update({ idUsuario: id_usuario }, nuevosDatos);
    const usuarioActualizado = await usuarioRepository.findOneBy({ idUsuario: id_usuario });
}

async function cambiarRolUsuario(id_usuario: number, nuevo_rol: rolUsuario): Promise<void> {
    await usuarioRepository.update({ idUsuario: id_usuario }, { rol: nuevo_rol });
    const usuarioActualizado = await usuarioRepository.findOneBy({ idUsuario: id_usuario });
}

async function cambiarEstadoUsuario(id_usuario: number, nuevosEstado: estadosUsuario): Promise<void> {
    await usuarioRepository.update({ idUsuario: id_usuario }, { estado: nuevosEstado });
    const usuarioActualizado = await usuarioRepository.findOneBy({ idUsuario: id_usuario });
}

async function resetearContraseñaUsuario(id_usuario: number, nuevaContraseña: string): Promise<void> {
    await usuarioRepository.update({ idUsuario: id_usuario }, { contraseña: nuevaContraseña });
    const usuarioActualizado = await usuarioRepository.findOneBy({ idUsuario: id_usuario });
}

async function bloquearUsuario(id_usuario: number, id_moderador: number, razon_bloqueo: string): Promise<void> {
    await usuarioRepository.update({ idUsuario: id_usuario }, { estado: estadosUsuario.BLOQUEADO, idBloqueador: id_moderador, razonBloqueo: razon_bloqueo });
    const usuarioActualizado = await usuarioRepository.findOneBy({ idUsuario: id_usuario });
}

async function listarUsuarios(): Promise<Array<Usuario>> {
    return await usuarioRepository.find();
}


