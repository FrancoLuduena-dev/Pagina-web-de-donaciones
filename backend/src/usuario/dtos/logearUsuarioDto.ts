import { IsString, IsNotEmpty, MinLength, IsEmail } from 'class-validator';

export default class logearUsuarioDTO {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  correo!: string;

  @IsString()
  @IsNotEmpty()
  contrasenia!: string;
}
