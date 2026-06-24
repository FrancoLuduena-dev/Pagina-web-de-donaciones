import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export default class ActualizarContraseniaDTO {

  @ApiProperty({
    description: 'Contraseña actual del usuario',
    example: 'Password123!',
    minLength: 8,
    format: 'password',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])(?!.*[#?]).*$/, {
    message:
      'La contraseña debe tener mayúscula, minúscula, número y símbolo (sin # ni ?)',
  })
  contraseniaActual!: string;

  @ApiProperty({
    description: 'Nueva contraseña del usuario',
    example: 'NuevaPass456!',
    minLength: 8,
    format: 'password',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])(?!.*[#?]).*$/, {
    message:
      'La contraseña debe tener mayúscula, minúscula, número y símbolo (sin # ni ?)',
  })
  contraseniaNueva!: string;
}
