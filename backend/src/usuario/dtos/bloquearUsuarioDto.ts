import { IsString, IsEnum, IsNotEmpty, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { estadosUsuario } from '../enums/estadosUsuario';

export class BloquearUsuarioDTO {
  @IsEnum(estadosUsuario)
  estado!: estadosUsuario;

  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  @IsString()
  @IsNotEmpty({ message: 'La razón de bloqueo es obligatoria' })
  @MaxLength(255, { message: 'La razón de bloqueo no puede superar los 255 caracteres' })
  razonBloqueo!: string;
}
