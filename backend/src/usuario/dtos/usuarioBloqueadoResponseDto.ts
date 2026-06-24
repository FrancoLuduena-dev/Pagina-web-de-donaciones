import { estadosUsuario } from "../enums/estadosUsuario";
import { ApiProperty } from '@nestjs/swagger';

export default class usuarioBloqueadoResponseDto {
    @ApiProperty({ enum: estadosUsuario })
    estado!: estadosUsuario;

    @ApiProperty({ nullable: true })
    razonBloqueo!: string | null;
}
