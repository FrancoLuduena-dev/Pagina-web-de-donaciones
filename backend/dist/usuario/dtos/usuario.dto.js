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
Object.defineProperty(exports, "__esModule", { value: true });
const estados_usuario_enum_1 = require("../enums/estados_usuario.enum");
const rol_usuario_enum_1 = require("../enums/rol_usuario.enum");
const class_validator_1 = require("class-validator");
class CrearUsuarioDto {
}
exports.default = CrearUsuarioDto;
__decorate([
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CrearUsuarioDto.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CrearUsuarioDto.prototype, "nombreCompleto", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CrearUsuarioDto.prototype, "nombreUsuario", void 0);
__decorate([
    (0, class_validator_1.IsEmail)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CrearUsuarioDto.prototype, "correo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(6),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CrearUsuarioDto.prototype, "contrase\u00F1a", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CrearUsuarioDto.prototype, "numeroTelefono", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(rol_usuario_enum_1.rolUsuario),
    __metadata("design:type", String)
], CrearUsuarioDto.prototype, "rol", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(estados_usuario_enum_1.estadosUsuario),
    __metadata("design:type", String)
], CrearUsuarioDto.prototype, "estado", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CrearUsuarioDto.prototype, "idBloqueador", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CrearUsuarioDto.prototype, "razonBloqueo", void 0);
//# sourceMappingURL=usuario.dto.js.map