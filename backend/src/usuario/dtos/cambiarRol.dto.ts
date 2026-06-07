
import { IsEnum } from 'class-validator';
import { rolUsuario } from '../enums/rol_usuario.enum';

export class CambiarRolDTO {
    @IsEnum(rolUsuario)
    rol!: rolUsuario;
}
