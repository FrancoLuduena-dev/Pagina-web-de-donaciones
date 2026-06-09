import { IsString, MinLength, IsOptional } from 'class-validator';

export default class actualizarContraseñaDTO {
  @IsString()
  @MinLength(6)
  @IsOptional()
  contraseña?: string;
}
