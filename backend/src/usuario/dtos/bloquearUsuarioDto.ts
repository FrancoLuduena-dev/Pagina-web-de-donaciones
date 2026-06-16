import { IsString } from 'class-validator';

export class BloquearUsuarioDTO {
  @IsString()
  razonBloqueo!: string;
}
