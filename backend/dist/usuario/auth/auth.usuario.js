"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = require("jsonwebtoken");
const usuario_service_1 = __importDefault(require("../service/usuario.service"));
const auth_constants_1 = require("./auth.constants");
class autenticacionUsuario {
    constructor() {
        this.service = new usuario_service_1.default();
    }
    async registrarUsuario(usuario) {
        const hashedPassword = await bcrypt_1.default.hash(usuario.contraseña, 10);
        const newUser = await this.service.Crear_Usuario({
            ...usuario,
            contraseña: hashedPassword,
        });
        if (!newUser) {
            throw new common_1.UnauthorizedException('Error al registrar el usuario');
        }
        return newUser;
    }
    async logearUsuario(datos) {
        const usuario = await this.service.ObtenerUsuarioPorNombreUsuario(datos.nombreUsuario);
        if (!usuario) {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos');
        }
        const isValid = await bcrypt_1.default.compare(datos.contraseña, usuario.contraseña);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Usuario o contraseña incorrectos');
        }
        const secret = auth_constants_1.JWT_SECRET;
        const options = {
            expiresIn: auth_constants_1.JWT_EXPIRATION,
        };
        return (0, jsonwebtoken_1.sign)({ id: usuario.id, correo: usuario.correo, rol: usuario.rol }, secret, options);
    }
    async validarToken(token) {
        try {
            const decoded = (0, jsonwebtoken_1.verify)(token, auth_constants_1.JWT_SECRET);
            const usuario = await this.service.obtenerUsuarioPorId(decoded.id);
            if (!usuario) {
                throw new common_1.UnauthorizedException('Usuario no encontrado');
            }
            return usuario;
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Token inválido');
        }
    }
}
exports.default = autenticacionUsuario;
//# sourceMappingURL=auth.usuario.js.map