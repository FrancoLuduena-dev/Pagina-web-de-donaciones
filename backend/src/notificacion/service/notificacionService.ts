import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CrearNotificacionDto } from '../dtos/crearNotificacionDto';
import { ListadoNotificacionesResponseDto } from '../dtos/listadoNotificacionesResponseDto';
import { NotificacionResponseDto } from '../dtos/notificacionResponseDto';
import { PaginacionNotificacionDto } from '../dtos/paginacionNotificacionDto';
import { NotificacionRepository } from '../repository/notificacionRepository';

@Injectable()
export class NotificacionService {
  constructor(
    private readonly notificacionRepository: NotificacionRepository,
  ) {}

  async crear(dto: CrearNotificacionDto): Promise<NotificacionResponseDto> {
    this.validarReferencias(dto);

    const notificacion = this.notificacionRepository.crear({
      destinatarioId: dto.destinatarioId,
      tipo: dto.tipo,
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      solicitudId: dto.solicitudId ?? null,
      publicacionId: dto.publicacionId ?? null,
      denunciaId: dto.denunciaId ?? null,
      leidaEn: null,
    });

    const notificacionGuardada =
      await this.notificacionRepository.guardar(notificacion);

    return NotificacionResponseDto.mapearDesdeEntidad(notificacionGuardada);
  }
  async listarPropias(
    destinatarioId: string,
    paginacion: PaginacionNotificacionDto,
  ): Promise<ListadoNotificacionesResponseDto> {
    const pagina = Number(paginacion.pagina ?? 1);
    const limite = Math.min(Number(paginacion.limite ?? 20), 50);

    const [notificaciones, total] =
      await this.notificacionRepository.listarPorDestinatario(
        destinatarioId,
        pagina,
        limite,
      );

    return {
      notificaciones: notificaciones.map((notificacion) =>
        NotificacionResponseDto.mapearDesdeEntidad(notificacion),
      ),
      total,
      pagina,
      limite,
      totalPaginas: Math.ceil(total / limite),
    };
  }

  contarNoLeidas(destinatarioId: string): Promise<number> {
    return this.notificacionRepository.contarNoLeidas(destinatarioId);
  }

  async marcarComoLeida(
    notificacionId: string,
    destinatarioId: string,
  ): Promise<NotificacionResponseDto> {
    const notificacion =
      await this.notificacionRepository.buscarPorIdYDestinatario(
        notificacionId,
        destinatarioId,
      );

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    notificacion.marcarComoLeida();

    const notificacionGuardada =
      await this.notificacionRepository.guardar(notificacion);

    return NotificacionResponseDto.mapearDesdeEntidad(notificacionGuardada);
  }

  async marcarTodasComoLeidas(destinatarioId: string): Promise<void> {
    await this.notificacionRepository.marcarTodasComoLeidas(destinatarioId);
  }

  private validarReferencias(dto: CrearNotificacionDto): void {
    const cantidadReferencias = [
      dto.solicitudId,
      dto.publicacionId,
      dto.denunciaId,
    ].filter((referenciaId) => referenciaId != null).length;

    if (cantidadReferencias > 1) {
      throw new BadRequestException(
        'Una notificación puede tener como máximo una referencia',
      );
    }
  }
}
