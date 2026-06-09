import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

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
