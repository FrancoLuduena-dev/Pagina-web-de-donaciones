import { IsEnum } from 'class-validator';
import { rolUsuario } from '../enums/rolUsuario';
import { ApiProperty } from '@nestjs/swagger';

export class CambiarRolDTO {
  @ApiProperty({ enum: rolUsuario })
  @IsEnum(rolUsuario)
  rol!: rolUsuario;
}
