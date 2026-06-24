import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BloquearUsuarioDTO {
  @ApiProperty({ example: 'Incumplimiento de normas', description: 'Razón del bloqueo' })
  @IsString()
  @IsNotEmpty({ message: 'La razón de bloqueo es obligatoria' })
  @MaxLength(255, { message: 'La razón de bloqueo no puede superar los 255 caracteres' })
  razonBloqueo!: string;
}
