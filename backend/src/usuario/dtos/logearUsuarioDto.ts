import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export default class logearUsuarioDTO {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100, { message: 'El correo no puede superar los 100 caracteres' })
  @ApiProperty({ example: 'juan@example.com', description: 'Correo del usuario para login' })
  correo!: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'S3gura!Pass', description: 'Contraseña del usuario' })
  contrasenia!: string;
}
