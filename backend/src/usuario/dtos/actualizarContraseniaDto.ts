import { IsString, MinLength, IsOptional } from 'class-validator';

export default class actualizarContraseniaDTO {
  @IsString()
  @MinLength(6)
  @IsOptional()
  contraseniaActual?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  contraseniaNueva?: string;
}
