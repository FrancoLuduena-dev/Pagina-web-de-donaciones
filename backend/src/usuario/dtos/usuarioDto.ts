import { estadosUsuario } from '../enums/estadosUsuario';
import { rolUsuario } from '../enums/rolUsuario';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  IsNumber,
} from 'class-validator';

export default class CrearUsuarioDto {

  @IsString()
  @IsNotEmpty()
  nombreCompleto!: string;

  @IsString()
  @IsNotEmpty()
  nombreUsuario!: string;

  @IsEmail()
  @IsNotEmpty()
  correo!: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  contrasenia!: string;

  @IsString()
  @IsNotEmpty()
  numeroTelefono!: string;
}
