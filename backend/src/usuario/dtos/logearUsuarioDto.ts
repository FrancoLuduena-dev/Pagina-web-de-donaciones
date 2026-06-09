import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';

export default class logearUsuarioDTO {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  correo!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  contrasenia!: string;
}
