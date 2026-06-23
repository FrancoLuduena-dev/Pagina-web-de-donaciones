import { IsString } from 'class-validator';

export class BloquearUsuarioDTO {
  @IsString()
  @IsNotEmpty({ message: 'La razón de bloqueo es obligatoria' })
  @MaxLength(255, { message: 'La razón de bloqueo no puede superar los 255 caracteres' })
  razonBloqueo!: string;
}
