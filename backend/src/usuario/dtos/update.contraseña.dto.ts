import { 
  IsString, 
  IsEmail, 
  IsNotEmpty, 
  MinLength, 
  IsOptional, 
  IsEnum, 
  IsNumber 
} from 'class-validator';

export default class actualizarContraseñaDTO {

    @IsString()
    @MinLength(6)
    @IsOptional()
    contraseña?: string;

}