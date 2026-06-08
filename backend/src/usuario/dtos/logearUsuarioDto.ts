import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export default class logearUsuarioDTO {
  @IsString()
  @IsNotEmpty()
  nombreUsuario!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  contrasenia!: string;
}
