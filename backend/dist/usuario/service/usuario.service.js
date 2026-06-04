"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const usuario_repository_1 = __importDefault(require("../repository/usuario.repository"));
const rol_usuario_enum_1 = require("../enums/rol_usuario.enum");
class Usuario_Service {
    constructor() {
        this.repo = new usuario_repository_1.default();
    }
    /*

 to do: ver especificamente las excepciones en base a que error salio en la ejecucion de cada metodo.
        tal vez crear excepciones personalizadas para cada caso.
     */
    async Crear_Usuario(usuario) {
        /*
        validar nombre usuario unico
        validar correo unico
        validar formato de correo
    
        */
        // Validar correo único
        const existeCorreo = await this.repo.buscarPorEmail(usuario.correo);
        if (existeCorreo)
            throw new common_1.ConflictException('El correo ya está registrado');
        // Validar username único
        const existeUser = await this.repo.buscarPorUsername(usuario.nombreUsuario);
        if (existeUser)
            throw new common_1.ConflictException('El nombre de usuario ya existe');
        return await this.repo.crearUsuario(usuario);
    }
    async Eliminar_Usuario(id_usuario, contraseña) {
        /* validar que el usuario exista */
        /* pedirle que confirme la contraseña al usuario*/
        const usuario = await this.obtenerUsuarioPorId(id_usuario);
        if (!usuario) {
            throw new common_1.ConflictException(`Usuario con id ${id_usuario} no encontrado`);
        }
        if (usuario.contraseña !== contraseña) {
            throw new common_1.ConflictException('La contraseña es incorrecta');
        }
        await this.repo.eliminarUsuario(id_usuario);
    }
    async Eliminar_Usuario_Admin(id_usuario, id_admin) {
        /* validar que el usuario exista */
        const usuario = await this.obtenerUsuarioPorId(id_usuario);
        const usuarioAdmin = await this.obtenerUsuarioPorId(id_admin);
        if (!usuario) {
            throw new common_1.ConflictException(`Usuario con id ${id_usuario} no encontrado`);
        }
        if (!usuarioAdmin) {
            throw new common_1.ConflictException(`Admin con id ${id_admin} no encontrado`);
        }
        if (usuarioAdmin.rol !== rol_usuario_enum_1.rolUsuario.USUARIO_ADMINISTRADOR) {
            throw new common_1.ConflictException(`El usuario con id ${id_admin} no tiene permisos de administrador para eliminar un usuario`);
        }
        await this.repo.eliminarUsuario(id_usuario);
    }
    async Actualizar_Usuario(id_usuario, datos) {
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
        if (existeCorreo)
            throw new common_1.ConflictException('El correo ya está registrado en la base de datos');
        if (usuario.correo === datos.correo) {
            throw new common_1.ConflictException(`El correo que intenta actualizar ya es el correo actual del usuario`);
        }
        const existeUser = await this.repo.buscarPorUsername(usuario.nombreUsuario);
        if (existeUser)
            throw new common_1.ConflictException('El nombre de usuario ya existe en la base de datos');
        if (usuario.nombreUsuario === datos.nombreUsuario) {
            throw new common_1.ConflictException(`El nombre de usuario que intenta actualizar ya es el nombre de usuario actual del usuario`);
        }
        await this.repo.actualizarUsuario(id_usuario, datos);
    }
    async obtenerUsuarioPorId(id_usuario) {
        const usuario = await this.repo.buscarPorId(id_usuario);
        if (!usuario) {
            throw new Error(`Usuario con id ${id_usuario} no encontrado`);
        }
        return await this.repo.buscarPorId(id_usuario);
    }
    async ObtenerUsuarioPorNombreUsuario(nombreUsuario) {
        return await this.repo.buscarPorUsername(nombreUsuario);
    }
    async ObtenerUsuarioPorCorreo(correo) {
        return await this.repo.buscarPorEmail(correo);
    }
    async Cambiar_Rol_Usuario(id_usuario, id_admin, datos) {
        /* verfifcar que el usuario tenga rol admin
        validar que el rol actual no sea el de admin
        */
        const usuario = await this.obtenerUsuarioPorId(id_usuario);
        const usuarioAdmin = await this.obtenerUsuarioPorId(id_admin);
        if (!usuario) {
            throw new common_1.ConflictException(`Usuario con id ${id_usuario} no encontrado`);
        }
        if (!usuarioAdmin) {
            throw new common_1.ConflictException(`Admin con id ${id_admin} no encontrado`);
        }
        if (usuarioAdmin.rol !== rol_usuario_enum_1.rolUsuario.USUARIO_ADMINISTRADOR) {
            throw new common_1.ConflictException(`El usuario con id ${id_admin} no tiene permisos de administrador para cambiar el rol de un usuario`);
        }
        await this.repo.cambiarRolUsuario(id_usuario, datos.rol);
    }
    async Resetear_Contraseña_Usuario(id_usuario, contraseña_actual, contraseña_nueva) {
        /* verfifcar que el usuario exista
        verificar que la contraseña actual sea correcta
        validar que la contraseña nueva no sea igual a la actual
        */
        const usuario = await this.obtenerUsuarioPorId(id_usuario);
        if (!usuario) {
            throw new common_1.ConflictException(`Usuario con id ${id_usuario} no encontrado`);
        }
        if (usuario.contraseña !== contraseña_actual) {
            throw new common_1.ConflictException('La contraseña actual es incorrecta');
        }
        if (usuario.contraseña === contraseña_nueva) {
            throw new common_1.ConflictException('La nueva contraseña no puede ser igual a la contraseña actual');
        }
        await this.repo.resetearContraseñaUsuario(id_usuario, contraseña_nueva);
    }
    async Bloquear_Usuario(id_usuario, id_moderador, datos) {
        /* verfifcar que el usuario tenga rol mod o admin
        verificar que el usuario bloqueador no sea el mismo que el bloqueado
        validar que el usuario bloqueado no este ya bloqueado
        validar que la razon de bloqueo no este vacia
        */
        const usuario = await this.obtenerUsuarioPorId(id_usuario);
        if (!usuario) {
            throw new common_1.ConflictException(`Usuario con id ${id_usuario} no encontrado`);
        }
        const usuarioModerador = await this.obtenerUsuarioPorId(id_moderador);
        if (!usuarioModerador) {
            throw new common_1.ConflictException(`Usuario moderador con id ${id_moderador} no encontrado`);
        }
        if (usuarioModerador.rol !== rol_usuario_enum_1.rolUsuario.USUARIO_MODERADOR && usuarioModerador.rol !== rol_usuario_enum_1.rolUsuario.USUARIO_ADMINISTRADOR) {
            throw new common_1.ConflictException(`El usuario con id ${id_moderador} no tiene permisos de moderador o administrador para bloquear un usuario`);
        }
        if (usuarioModerador.rol === 'USUARIO_MODERADOR' && usuario.rol === 'USUARIO_ADMINISTRADOR' || usuario.rol === 'USUARIO_MODERADOR') {
            throw new common_1.ConflictException(`El usuario con id ${id_moderador} no tiene permisos para bloquear a un usuario con rol de moderador o administrador`);
        }
        if (usuario.estado === 'BLOQUEADO') {
            throw new common_1.ConflictException(`El usuario con id ${id_usuario} ya se encuentra bloqueado`);
        }
        if (datos.razonBloqueo === null || datos.razonBloqueo === '') {
            throw new common_1.ConflictException(`La razón de bloqueo no puede estar vacía`);
        }
        await this.repo.bloquearUsuario(id_usuario, id_moderador, datos.razonBloqueo);
    }
    async Listar_Usuarios() {
        return await this.repo.listarUsuarios();
    }
}
exports.default = Usuario_Service;
//# sourceMappingURL=usuario.service.js.map