"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const usuario_service_1 = __importDefault(require("../service/usuario.service"));
const usuario_dto_1 = __importDefault(require("../dtos/usuario.dto"));
const auth_usuario_1 = __importDefault(require("../auth/auth.usuario"));
const bloquearUsuario_dto_1 = require("../dtos/bloquearUsuario.dto");
const update_usuario_dto_1 = __importDefault(require("../dtos/update.usuario.dto"));
const cambiarRol_dto_1 = require("../dtos/cambiarRol.dto");
const logearUsuario_dto_1 = __importDefault(require("../dtos/logearUsuario.dto"));
const auth_guard_1 = require("../auth/auth.guard");
/*
 to do: quitar del body el id_usuario en los endpoints que lo requieran y obtenerlo del token de autenticacion.
       usar el ward de nest para validar el rol de usuario para la ejecucion de metodos con privilegios de admin o moderador.
*/
let Usuario_Controller = class Usuario_Controller {
    constructor(service, authService) {
        this.service = service;
        this.authService = authService;
    }
    async crearUsuario(usuario) {
        return this.authService.registrarUsuario(usuario);
    }
    async login(datos) {
        const token = await this.authService.logearUsuario(datos);
        return { access_token: token };
    }
    async listarUsuarios() {
        return this.service.Listar_Usuarios();
    }
    async obtenerUsuarioPorId(id) {
        return this.service.obtenerUsuarioPorId(id);
    }
    async obtenerUsuarioPorNombreUsuario(nombreUsuario) {
        return this.service.ObtenerUsuarioPorNombreUsuario(nombreUsuario);
    }
    async borrarUsuario(id, contraseña) {
        return this.service.Eliminar_Usuario(id, contraseña);
    }
    async actualizarUsuario(id, datos) {
        return this.service.Actualizar_Usuario(id, datos);
    }
    async cambiarRolUsuario(id, id_admin, datos) {
        return this.service.Cambiar_Rol_Usuario(id, id_admin, datos);
    }
    async resetearContraseña(id, contraseña_actual, contraseña_nueva) {
        return this.service.Resetear_Contraseña_Usuario(id, contraseña_actual, contraseña_nueva);
    }
    async bloquearUsuario(id, id_moderador, datos) {
        return this.service.Bloquear_Usuario(id, id_moderador, datos);
    }
};
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [usuario_dto_1.default]),
    __metadata("design:returntype", Promise)
], Usuario_Controller.prototype, "crearUsuario", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [logearUsuario_dto_1.default]),
    __metadata("design:returntype", Promise)
], Usuario_Controller.prototype, "login", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], Usuario_Controller.prototype, "listarUsuarios", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], Usuario_Controller.prototype, "obtenerUsuarioPorId", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Get)('nombre/:nombreUsuario'),
    __param(0, (0, common_1.Param)('nombreUsuario')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], Usuario_Controller.prototype, "obtenerUsuarioPorNombreUsuario", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('contraseña')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], Usuario_Controller.prototype, "borrarUsuario", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_usuario_dto_1.default]),
    __metadata("design:returntype", Promise)
], Usuario_Controller.prototype, "actualizarUsuario", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Patch)(':id/rol'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('id_admin')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, cambiarRol_dto_1.CambiarRolDTO]),
    __metadata("design:returntype", Promise)
], Usuario_Controller.prototype, "cambiarRolUsuario", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Patch)(':id/resetear_contraseña'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('contraseña_actual')),
    __param(2, (0, common_1.Body)('contraseña_nueva')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String, String]),
    __metadata("design:returntype", Promise)
], Usuario_Controller.prototype, "resetearContrase\u00F1a", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    (0, common_1.Patch)(':id/bloquear_usuario'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('id_moderador')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, bloquearUsuario_dto_1.BloquearUsuarioDTO]),
    __metadata("design:returntype", Promise)
], Usuario_Controller.prototype, "bloquearUsuario", null);
Usuario_Controller = __decorate([
    (0, common_1.Controller)('usuario'),
    __metadata("design:paramtypes", [usuario_service_1.default, auth_usuario_1.default])
], Usuario_Controller);
exports.default = Usuario_Controller;
//# sourceMappingURL=usuario.controller.js.map