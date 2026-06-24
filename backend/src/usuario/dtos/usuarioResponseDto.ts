import { ApiProperty } from '@nestjs/swagger';

export default class usuarioResponseDto {
    @ApiProperty({ example: 'uuid-1234', description: 'ID del usuario' })
    id!: string;

    @ApiProperty({ example: 'juanp', description: 'Nombre de usuario' })
    nombreUsuario!: string;

    @ApiProperty({ example: 'Juan Perez', description: 'Nombre completo' })
    nombreCompleto!: string;
}
