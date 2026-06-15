import { IsString, MinLength, IsOptional } from 'class-validator';

export default class actualizarContraseniaDTO {
  @IsString()
  @MinLength(6)
  contraseniaActual!: string;

  @IsString()
  @MinLength(6)
  contraseniaNueva!: string;
}
