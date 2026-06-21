
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsNumber,
  Matches
} from 'class-validator';

export default class CrearUsuarioDto {

  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @Matches(/^(?!.*(;|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC)\b))/i, {
    message: 'No se pueden enviar palabras de tipo query'
  })
  nombreCompleto!: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @Matches(/^(?!.*(;|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC)\b))/i, {
    message: 'No se pueden enviar palabras de tipo query'
  })
  nombreUsuario!: string;

  @IsEmail()
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @Matches(/^(?!.*(;|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC)\b))/i, {
    message: 'No se pueden enviar palabras de tipo query'
  })
  correo!: string;

  @IsString()
  @MinLength(8)
  @IsNotEmpty({ message: 'La contraseña es obligatorio' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])(?!.*[#?]).*$/, {
    message: 'La contraseña debe tener mayúscula, minúscula, número y símbolo (sin # ni ?)'
  })
  contrasenia!: string;

  @IsString()
  @IsNotEmpty({ message: 'El telefono es obligatorio' })
  @Matches(/^\+?[0-9\s]{8,20}$/, {
    message: 'Formato de teléfono inválido'
  })
  numeroTelefono!: string;
}
