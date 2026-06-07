
import { IsEnum } from 'class-validator';
import { rolUsuario } from '../enums/rolUsuario.enum';

export class CambiarRolDTO {
    @IsEnum(rolUsuario)
    rol!: rolUsuario;
}
