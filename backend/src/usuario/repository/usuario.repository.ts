import Usuario from "../models/usuario.entity";
import { DataSource } from "typeorm";
import { AppDataSource } from "../../index";
import { rolUsuario } from "../enums/rol_usuario.enum";
import { estadosUsuario } from "../enums/estados_usuario.enum";



const usuarioRepository = AppDataSource.getRepository(Usuario);

export default class UsuarioRepository {

    async crearUsuario(datos: Partial<Usuario>): Promise<Usuario> {
        const nuevoUsuario = usuarioRepository.create(datos);
        return await usuarioRepository.save(nuevoUsuario);
    }

    async eliminarUsuario(id_usuario: number): Promise<void> {
        const usuarioAEliminar = await usuarioRepository.findOneBy({ id: id_usuario });
        await usuarioRepository.remove(usuarioAEliminar!);
    }

    async buscarPorId(id: number): Promise<Usuario | null> {
        return await usuarioRepository.findOneBy({ id });
    }

    async buscarPorEmail(email: string): Promise<Usuario | null> {
        return await usuarioRepository.findOneBy({ correo: email });
    }

    async buscarPorUsername(nombreUsuario: string): Promise<Usuario | null> {
        return await usuarioRepository.findOneBy({ nombreUsuario });
    }

    async actualizarUsuario(id_usuario: number, nuevosDatos: Partial<Usuario>): Promise<void> {
        await usuarioRepository.update({ id: id_usuario }, nuevosDatos);
        await usuarioRepository.findOneBy({ id: id_usuario });
    }

    async cambiarRolUsuario(id_usuario: number, nuevo_rol: rolUsuario): Promise<void> {
        await usuarioRepository.update({ id: id_usuario }, { rol: nuevo_rol });
        await usuarioRepository.findOneBy({ id: id_usuario });
    }

    async cambiarEstadoUsuario(id_usuario: number, nuevoEstado: estadosUsuario): Promise<void> {
        await usuarioRepository.update({ id: id_usuario }, { estado: nuevoEstado });
        await usuarioRepository.findOneBy({ id: id_usuario });
    }

    async resetearContraseñaUsuario(id_usuario: number, nuevaContraseña: string): Promise<void> {
        await usuarioRepository.update({ id: id_usuario }, { contraseña: nuevaContraseña });
        await usuarioRepository.findOneBy({ id: id_usuario });
    }

    async bloquearUsuario(id_usuario: number, id_moderador: number, razon_bloqueo: string): Promise<void> {
        await usuarioRepository.update({ id: id_usuario }, { estado: estadosUsuario.BLOQUEADO, idBloqueador: id_moderador, razonBloqueo: razon_bloqueo });
        await usuarioRepository.findOneBy({ id: id_usuario });
    }

    async listarUsuarios(): Promise<Array<Usuario>> {
        return await usuarioRepository.find();
    }
}



