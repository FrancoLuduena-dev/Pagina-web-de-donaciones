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

export class BloquearUsuarioDTO {
    @IsEnum(estadosUsuario)
    estado!: estadosUsuario;

    @IsString()
    razonBloqueo!: string;
}