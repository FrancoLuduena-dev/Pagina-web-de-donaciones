import { IsString, IsEmail, IsOptional, ValidateIf, Matches, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export default class actualizarUsuarioDTO {
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'El nombre completo no puede superar los 100 caracteres' })
  @Matches(/^(?!.*(;|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC)\b))/i)
  nombreCompleto?: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'El nombre de usuario no puede superar los 50 caracteres' })
  @Matches(/^(?!.*(;|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC)\b))/i)
  nombreUsuario?: string;

  @ValidateIf((o) => o.correo !== '')
  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @IsEmail()
  @IsOptional()
  @MaxLength(100, { message: 'El correo no puede superar los 100 caracteres' })
  @Matches(/^(?!.*(;|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC)\b))/i)
  correo?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value === '' ? undefined : value,
  )
  @MaxLength(20, { message: 'El teléfono no puede superar los 20 caracteres' })
  @Matches(/^\+?[0-9\s]{8,20}$/, {
    message: 'Formato de teléfono inválido'
  })
  numeroTelefono?: string;
}
