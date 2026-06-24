import { rolUsuario } from "../enums/rolUsuario";
import { estadosUsuario } from "../enums/estadosUsuario";
import { ApiProperty } from '@nestjs/swagger';

export class MiUsuarioResponseDto {
  @ApiProperty({ example: 'uuid-1234' })
  id!: string;

  @ApiProperty({ example: 'Juan Perez' })
  nombreCompleto!: string;

  @ApiProperty({ example: 'juanp' })
  nombreUsuario!: string;

  @ApiProperty({ example: 'juan@example.com' })
  correo!: string;

  @ApiProperty({ example: '+5491123456789' })
  numeroTelefono!: string;

  @ApiProperty({ enum: rolUsuario })
  rol!: rolUsuario;

  @ApiProperty({ enum: estadosUsuario })
  estado!: estadosUsuario;

  @ApiProperty({ nullable: true, required: false })
  razonBloqueo?: string | null;
}