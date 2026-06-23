import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { MotivoDenuncia } from '../enums/motivoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';

export class DenunciaResponseDto {
  id!: string;

  publicacionId!: string;
  denuncianteId!: string;
  creadorPublicacionId!: string;
  moderadorAsignadoId?: string | null;
  motivo!: MotivoDenuncia;
  comentario?: string | null;
  estado!: EstadoDenuncia;
  tipoResolucion?: TipoResolucion | null;
  fechaCreacion!: Date;
  fechaActualizacion!: Date;
  version!: number;
}
