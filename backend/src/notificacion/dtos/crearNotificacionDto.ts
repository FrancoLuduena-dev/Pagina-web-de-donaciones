import { TipoNotificacion } from '../enum/tipoNotificacion';

export class CrearNotificacionDto {
  destinatarioId!: string;
  tipo!: TipoNotificacion;
  titulo!: string;
  mensaje!: string;
  solicitudId?: string | null;
  publicacionId?: string | null;
  denunciaId?: string | null;
}
