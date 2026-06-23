import { NotificacionResponseDto } from './notificacionResponseDto';

export class ListadoNotificacionesResponseDto {
  notificaciones!: NotificacionResponseDto[];
  total!: number;
  pagina!: number;
  limite!: number;
  totalPaginas!: number;
}
