import { IsString, IsNotEmpty, IsEmail, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export default class logearUsuarioDTO {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100, { message: 'El correo no puede superar los 100 caracteres' })
  correo!: string;

  @IsString()
  @IsNotEmpty()
  contrasenia!: string;
}
