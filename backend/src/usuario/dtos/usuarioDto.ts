
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export default class CrearUsuarioDto {

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @ApiProperty({ example: 'Juan Perez', description: 'Nombre completo del usuario' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre completo es obligatorio' })
  @MaxLength(100, { message: 'El nombre completo no puede superar los 100 caracteres' })
  @Matches(/^(?!.*(;|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC)\b))/i, {
    message: 'No se pueden enviar palabras de tipo query'
  })
  nombreCompleto!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @ApiProperty({ example: 'juanp', description: 'Nombre de usuario único' })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de usuario es obligatorio' })
  @MaxLength(50, { message: 'El nombre de usuario no puede superar los 50 caracteres' })
  @Matches(/^(?!.*(;|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC)\b))/i, {
    message: 'No se pueden enviar palabras de tipo query'
  })
  nombreUsuario!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().toLowerCase() : value)
  @ApiProperty({ example: 'juan@example.com', description: 'Correo electrónico del usuario' })
  @IsEmail()
  @IsNotEmpty({ message: 'El correo es obligatorio' })
  @MaxLength(100, { message: 'El correo no puede superar los 100 caracteres' })
  @Matches(/^(?!.*(;|--|\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|EXEC)\b))/i, {
    message: 'No se pueden enviar palabras de tipo query'
  })
  correo!: string;

  @IsString()
  @ApiProperty({ example: 'S3gura!Pass', description: 'Contraseña del usuario' })
  @MinLength(8)
  @IsNotEmpty({ message: 'La contraseña es obligatorio' })
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])(?!.*[#?]).*$/, {
    message: 'La contraseña debe tener mayúscula, minúscula, número y símbolo (sin # ni ?)'
  })
  contrasenia!: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @ApiProperty({ example: '+5491123456789', description: 'Número de teléfono con código de país' })
  @IsString()
  @IsNotEmpty({ message: 'El telefono es obligatorio' })
  @MaxLength(20, { message: 'El teléfono no puede superar los 20 caracteres' })
  @Matches(/^\+?[0-9\s]{8,20}$/, {
    message: 'Formato de teléfono inválido'
  })
  numeroTelefono!: string;
}
