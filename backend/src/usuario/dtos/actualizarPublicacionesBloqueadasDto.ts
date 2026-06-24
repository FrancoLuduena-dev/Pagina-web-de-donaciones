import { ApiProperty } from '@nestjs/swagger';
import { estadosUsuario } from '../enums/estadosUsuario';

export default class ActualizarPublicacionesBloqueadasDto {

    @ApiProperty({
        description: 'Motivo por el cual se bloquean las publicaciones',
        example: 'Contenido inapropiado',
        nullable: true,
    })
    razonBloqueo!: string | null;

    @ApiProperty({
        description: 'Estado actual del usuario',
        enum: estadosUsuario,
        example: estadosUsuario.BLOQUEADO, // ajustá según tu enum
    })
    estado!: estadosUsuario;

    @ApiProperty({
        description: 'Cantidad de publicaciones bloqueadas',
        example: 3,
    })
    cantidadPublicacionesBloqueadas!: number;
}