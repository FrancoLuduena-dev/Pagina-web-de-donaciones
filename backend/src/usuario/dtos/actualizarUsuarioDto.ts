import { IsString, IsEmail, IsOptional, ValidateIf } from 'class-validator';

export default class actualizarUsuarioDTO {
  @IsString()
  @IsOptional()
  nombreCompleto?: string;

  @IsString()
  @IsOptional()
  nombreUsuario?: string;

  @ValidateIf((o) => o.correo !== '')
  @IsEmail()
  @IsOptional()
  correo?: string;

  @IsString()
  @IsOptional()
  numeroTelefono?: string;
}
