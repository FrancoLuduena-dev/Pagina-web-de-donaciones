"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const usuario_entity_1 = __importDefault(require("../models/usuario.entity"));
const index_1 = require("../../index");
const estados_usuario_enum_1 = require("../enums/estados_usuario.enum");
const usuarioRepository = index_1.AppDataSource.getRepository(usuario_entity_1.default);
class UsuarioRepository {
    async crearUsuario(datos) {
        const nuevoUsuario = usuarioRepository.create(datos);
        return await usuarioRepository.save(nuevoUsuario);
    }
    async eliminarUsuario(id_usuario) {
        const usuarioAEliminar = await usuarioRepository.findOneBy({ id: id_usuario });
        await usuarioRepository.remove(usuarioAEliminar);
    }
    async buscarPorId(id) {
        return await usuarioRepository.findOneBy({ id });
    }
    async buscarPorEmail(email) {
        return await usuarioRepository.findOneBy({ correo: email });
    }
    async buscarPorUsername(nombreUsuario) {
        return await usuarioRepository.findOneBy({ nombreUsuario });
    }
    async actualizarUsuario(id_usuario, nuevosDatos) {
        await usuarioRepository.update({ id: id_usuario }, nuevosDatos);
        await usuarioRepository.findOneBy({ id: id_usuario });
    }
    async cambiarRolUsuario(id_usuario, nuevo_rol) {
        await usuarioRepository.update({ id: id_usuario }, { rol: nuevo_rol });
        await usuarioRepository.findOneBy({ id: id_usuario });
    }
    async cambiarEstadoUsuario(id_usuario, nuevoEstado) {
        await usuarioRepository.update({ id: id_usuario }, { estado: nuevoEstado });
        await usuarioRepository.findOneBy({ id: id_usuario });
    }
    async resetearContraseñaUsuario(id_usuario, nuevaContraseña) {
        await usuarioRepository.update({ id: id_usuario }, { contraseña: nuevaContraseña });
        await usuarioRepository.findOneBy({ id: id_usuario });
    }
    async bloquearUsuario(id_usuario, id_moderador, razon_bloqueo) {
        await usuarioRepository.update({ id: id_usuario }, { estado: estados_usuario_enum_1.estadosUsuario.BLOQUEADO, idBloqueador: id_moderador, razonBloqueo: razon_bloqueo });
        await usuarioRepository.findOneBy({ id: id_usuario });
    }
    async listarUsuarios() {
        return await usuarioRepository.find();
    }
}
exports.default = UsuarioRepository;
//# sourceMappingURL=usuario.repository.js.map