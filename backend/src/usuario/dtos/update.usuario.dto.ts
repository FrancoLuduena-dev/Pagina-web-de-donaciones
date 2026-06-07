import { 
  IsString, 
  IsEmail, 
  IsNotEmpty, 
  MinLength, 
  IsOptional, 
  IsEnum, 
  IsNumber 
} from 'class-validator';
import { estadosUsuario } from '../enums/estadosUsuario.enum';
import { rolUsuario } from '../enums/rolUsuario.enum';

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