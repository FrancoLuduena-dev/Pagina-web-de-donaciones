import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';

import { StatusGuard } from '../../compartidos/guards/statusGuard';
import type { RequestConUsuario } from '../../compartidos/tipo/requestConUsuario';
import { AuthGuard } from '../../usuario/auth/authGuard';
import { CantidadNoLeidasResponseDto } from '../dtos/cantidadNoLeidasResponseDto';
import { ListadoNotificacionesResponseDto } from '../dtos/listadoNotificacionesResponseDto';
import { NotificacionResponseDto } from '../dtos/notificacionResponseDto';
import { PaginacionNotificacionDto } from '../dtos/paginacionNotificacionDto';
import { NotificacionService } from '../service/notificacionService';

/**
 * Controlador responsable de exponer los endpoints de notificaciones del usuario autenticado.
 *
 * Recibe las peticiones HTTP relacionadas con la consulta y actualización del
 * estado de lectura de las notificaciones y delega la lógica de negocio al servicio.
 */
@ApiTags('Notificaciones')
@ApiBearerAuth('access-token')
@Controller('notificaciones')
@UseGuards(AuthGuard, StatusGuard)
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  /**
   * Lista las notificaciones propias del usuario autenticado.
   *
   * El endpoint devuelve las notificaciones del usuario en orden descendente
   * de creación y permite paginar el resultado.
   */
  @Get()
  @ApiOperation({
    summary: 'Listar mis notificaciones',
    description:
      'Devuelve el listado paginado de notificaciones del usuario autenticado.',
  })
  @ApiOkResponse({
    description: 'Listado paginado de notificaciones del usuario autenticado',
    type: ListadoNotificacionesResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({ description: 'Usuario sin permiso para operar' })
  listarPropias(
    @Req() req: RequestConUsuario,
    @Query() paginacion: PaginacionNotificacionDto,
  ): Promise<ListadoNotificacionesResponseDto> {
    return this.notificacionService.listarPropias(req.user.id, paginacion);
  }

  /**
   * Cuenta la cantidad de notificaciones aún no leídas por el usuario.
   *
   * Esta operación sirve para presentar indicadores de mensajes pendientes.
   */
  @Get('no-leidas/cantidad')
  @ApiOperation({
    summary: 'Contar mis notificaciones no leídas',
    description:
      'Devuelve la cantidad de notificaciones pendientes de lectura para el usuario autenticado.',
  })
  @ApiOkResponse({
    description: 'Cantidad de notificaciones no leídas',
    type: CantidadNoLeidasResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({ description: 'Usuario sin permiso para operar' })
  async contarNoLeidas(
    @Req() req: RequestConUsuario,
  ): Promise<CantidadNoLeidasResponseDto> {
    const cantidad = await this.notificacionService.contarNoLeidas(req.user.id);

    return { cantidad };
  }

  /**
   * Marca todas las notificaciones del usuario como leídas.
   *
   * La operación deja sin pendiente de lectura todo el conjunto de avisos del
   * usuario autenticado.
   */
  @Patch('marcar-todas-leidas')
  @ApiOperation({
    summary: 'Marcar todas mis notificaciones como leídas',
    description:
      'Actualiza el estado de lectura de todas las notificaciones propias del usuario autenticado.',
  })
  @ApiOkResponse({
    description: 'Todas las notificaciones fueron marcadas como leídas',
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({ description: 'Usuario sin permiso para operar' })
  async marcarTodasComoLeidas(@Req() req: RequestConUsuario): Promise<void> {
    await this.notificacionService.marcarTodasComoLeidas(req.user.id);
  }

  /**
   * Marca una notificación concreta como leída.
   *
   * La operación valida que la notificación pertenezca al usuario autenticado
   * antes de actualizar su estado de lectura.
   */
  @Patch(':id/marcar-leida')
  @ApiOperation({
    summary: 'Marcar una notificación como leída',
    description:
      'Marca como leída una notificación propia del usuario autenticado.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la notificación',
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
  })
  @ApiOkResponse({
    description: 'Notificación marcada como leída',
    type: NotificacionResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({ description: 'Usuario sin permiso para operar' })
  @ApiNotFoundResponse({ description: 'Notificación no encontrada' })
  marcarComoLeida(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<NotificacionResponseDto> {
    return this.notificacionService.marcarComoLeida(id, req.user.id);
  }
}
