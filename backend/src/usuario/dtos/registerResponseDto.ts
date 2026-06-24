import { ApiProperty } from '@nestjs/swagger';

export default class RegisterResponseDto {
    @ApiProperty({ example: 'Usuario registrado correctamente' })
    message!: string;

    @ApiProperty({
        example: {
            id: 'uuid-1234',
            correo: 'juan@example.com',
            nombreUsuario: 'juanp',
        },
    })
    user!: {
        id: string;
        correo: string;
        nombreUsuario: string;
    };

}