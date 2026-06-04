import { 
  IsString, 
  IsEmail, 
  IsNotEmpty, 
  MinLength, 
  IsOptional, 
  IsEnum, 
  IsNumber 
} from 'class-validator';
import { estadosUsuario } from '../enums/estados_usuario.enum';
import { rolUsuario } from '../enums/rol_usuario.enum';

export default class actualizarUsuarioDTO {

    @IsString()
    @IsOptional()
    nombreCompleto?: string;

    @IsString()
    @IsOptional()
    nombreUsuario?: string;

    @IsEmail()
    @IsOptional()
    correo?: string;

    @IsString()
    @MinLength(6)
    @IsOptional()
    contraseña?: string;

    @IsString()
    @IsOptional()
    numeroTelefono?: string;
}