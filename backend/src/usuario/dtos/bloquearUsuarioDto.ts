import { IsString, IsEnum } from 'class-validator';
import { estadosUsuario } from '../enums/estadosUsuario';

export class BloquearUsuarioDTO {
  @IsEnum(estadosUsuario)
  estado!: estadosUsuario;

  @IsString()
  razonBloqueo!: string;
}
