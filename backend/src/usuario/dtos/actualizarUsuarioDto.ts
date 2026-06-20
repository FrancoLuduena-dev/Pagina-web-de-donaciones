import { IsString, IsEmail, IsOptional, ValidateIf, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export default class actualizarUsuarioDTO {
  @IsString()
  @IsOptional()
  @Matches(/^(?!.*(;|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC)\b))/i)
  nombreCompleto?: string;

  @IsString()
  @IsOptional()
  @Matches(/^(?!.*(;|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC)\b))/i)
  nombreUsuario?: string;

  @ValidateIf((o) => o.correo !== '')
  @IsEmail()
  @IsOptional()
  @Matches(/^(?!.*(;|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC)\b))/i)
  correo?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value === '' ? undefined : value)
  @Matches(/^\+?[0-9\s]{8,20}$/, {
    message: 'Formato de teléfono inválido'
  })
  numeroTelefono?: string;
}
