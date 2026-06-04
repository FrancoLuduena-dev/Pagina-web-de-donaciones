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
const typeorm_1 = require("typeorm");
const rol_usuario_enum_1 = require("../enums/rol_usuario.enum");
const estados_usuario_enum_1 = require("../enums/estados_usuario.enum");
let Usuario = class Usuario {
};
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], Usuario.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Usuario.prototype, "nombreCompleto", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    __metadata("design:type", String)
], Usuario.prototype, "nombreUsuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 100 }),
    __metadata("design:type", String)
], Usuario.prototype, "correo", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Usuario.prototype, "contrase\u00F1a", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], Usuario.prototype, "numeroTelefono", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: rol_usuario_enum_1.rolUsuario,
        default: rol_usuario_enum_1.rolUsuario.USUARIO_NORMAL
    }),
    __metadata("design:type", String)
], Usuario.prototype, "rol", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: estados_usuario_enum_1.estadosUsuario,
        default: estados_usuario_enum_1.estadosUsuario.ACTIVO
    }),
    __metadata("design:type", String)
], Usuario.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "idBloqueador", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "razonBloqueo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "cantidadPublicacionesBloqueadas", void 0);
Usuario = __decorate([
    (0, typeorm_1.Entity)()
], Usuario);
exports.default = Usuario;
/*
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { estados_usuario } from '../enums/estados_usuario.enum';
import { rol_usuario } from '../enums/rol_usuario.enum';

@Entity()
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre_completo: string;

  @Column({ unique: true })
  nombre_usuario: string;

  @Column({ unique: true })
  correo: string;

  @Column()
  contraseña: string;

  @Column()
  numero_telefono: string;

  @Column({
    type: 'enum',
    enum: rol_usuario,
  })
  rol: rol_usuario;

  @Column({
    type: 'enum',
    enum: estados_usuario,
  })
  estado: estados_usuario;

  @Column({ nullable: true })
  id_bloqueador: number;

  @Column({ nullable: true })
  razon_bloqueo: string;
}
*/ 
//# sourceMappingURL=usuario.entity.js.map