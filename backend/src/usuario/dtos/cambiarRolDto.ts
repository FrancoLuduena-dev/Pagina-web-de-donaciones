import { IsEnum } from 'class-validator';
import { rolUsuario } from '../enums/rolUsuario';

export class CambiarRolDTO {
  @IsEnum(rolUsuario)
  rol!: rolUsuario;
}
