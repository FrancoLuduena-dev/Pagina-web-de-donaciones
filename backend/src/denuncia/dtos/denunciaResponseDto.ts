import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { MotivoDenuncia } from '../enums/motivoDenuncia';

export class DenunciaResponseDto {
  id!: string;

  publicacionId!: string;

  motivo!: MotivoDenuncia;

  estado!: EstadoDenuncia;

  fechaCreacion!: Date;

  version!: number;
}
