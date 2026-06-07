import { 
  IsString, 
  IsEmail, 
  IsNotEmpty, 
  MinLength, 
  IsOptional, 
  IsEnum, 
  IsNumber 
} from 'class-validator';

export default class logearUsuarioDTO {

    @IsString()
    @IsNotEmpty()
    nombreUsuario!: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    contraseña!: string;

}