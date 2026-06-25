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

/**
 * Servicio encargado de gestionar el ciclo de vida de las notificaciones del sistema.
 *
 * Centraliza la creación de avisos, su consulta para el usuario autenticado y la
 * actualización del estado de lectura, delegando la persistencia al repositorio.
 */
@Injectable()
export class NotificacionService {
  constructor(
    private readonly notificacionRepository: NotificacionRepository,
  ) {}

  /**
   * Crea una nueva notificación a partir de un evento o acción del sistema.
   *
   * El servicio valida que la notificación tenga como máximo una referencia a
   * una entidad relacionada y luego la persiste para que el destinatario pueda
   * consultarla desde su panel de notificaciones.
   *
   * @param dto Datos de la notificación a crear.
   * @returns Notificación creada serializada para la respuesta.
   * @throws BadRequestException Si la notificación recibe más de una referencia asociada.
   */
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

  /**
   * Lista las notificaciones propias del usuario destinatario.
   *
   * El método aplica paginación para evitar devolver demasiados avisos de una vez
   * y permite al usuario revisar su historial de notificaciones.
   *
   * @param destinatarioId Identificador del usuario autenticado.
   * @param paginacion Parámetros de paginación de la consulta.
   * @returns Listado paginado de notificaciones y metadatos de paginación.
   */
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

  /**
   * Cuenta las notificaciones que aún no fueron leídas por el usuario.
   *
   * Esta consulta sirve para informar al usuario sobre mensajes pendientes de revisión.
   *
   * @param destinatarioId Identificador del usuario destinatario.
   * @returns Cantidad de notificaciones sin leer.
   */
  contarNoLeidas(destinatarioId: string): Promise<number> {
    return this.notificacionRepository.contarNoLeidas(destinatarioId);
  }

  /**
   * Marca una notificación como leída cuando pertenece al usuario autenticado.
   *
   * La validación de pertenencia evita que un usuario consulte o modifique
   * notificaciones que no le corresponden.
   *
   * @param notificacionId Identificador de la notificación a actualizar.
   * @param destinatarioId Identificador del usuario autenticado.
   * @returns Notificación actualizada serializada para la respuesta.
   * @throws NotFoundException Si la notificación no existe o no pertenece al usuario.
   */
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

  /**
   * Marca todas las notificaciones pendientes del usuario como leídas.
   *
   * Esta operación evita que el usuario siga viendo un conjunto de avisos como
   * pendientes de revisión luego de haberlos revisado.
   *
   * @param destinatarioId Identificador del usuario autenticado.
   */
  async marcarTodasComoLeidas(destinatarioId: string): Promise<void> {
    await this.notificacionRepository.marcarTodasComoLeidas(destinatarioId);
  }

  /**
   * Valida que la notificación tenga como máximo una referencia relacionada.
   *
   * La entidad permite vincular una notificación a una solicitud, una publicación
   * o una denuncia, pero no a varias a la vez.
   *
   * @param dto Datos de la notificación a validar.
   * @throws BadRequestException Si se suministran múltiples referencias.
   */
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
