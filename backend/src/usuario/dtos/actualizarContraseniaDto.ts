import { IsString, MinLength, Matches } from 'class-validator';

export default class actualizarContraseniaDTO {
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])(?!.*[#?]).*$/, {
    message: 'La contraseña debe tener mayúscula, minúscula, número y símbolo (sin # ni ?)'
  })
  contraseniaActual!: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^\w\s])(?!.*[#?]).*$/, {
    message: 'La contraseña debe tener mayúscula, minúscula, número y símbolo (sin # ni ?)'
  })
  contraseniaNueva!: string;
}
