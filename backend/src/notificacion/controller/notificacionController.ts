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
  ApiNoContentResponse,
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

@ApiTags('Notificaciones')
@ApiBearerAuth()
@Controller('notificaciones')
@UseGuards(AuthGuard, StatusGuard)
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  @Get()
  @ApiOperation({ summary: 'Listar mis notificaciones' })
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

  @Get('no-leidas/cantidad')
  @ApiOperation({ summary: 'Contar mis notificaciones no leídas' })
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

  @Patch('marcar-todas-leidas')
  @ApiOperation({ summary: 'Marcar todas mis notificaciones como leídas' })
  @ApiNoContentResponse({
    description: 'Todas las notificaciones fueron marcadas como leídas',
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({ description: 'Usuario sin permiso para operar' })
  async marcarTodasComoLeidas(@Req() req: RequestConUsuario): Promise<void> {
    await this.notificacionService.marcarTodasComoLeidas(req.user.id);
  }

  @Patch(':id/marcar-leida')
  @ApiOperation({ summary: 'Marcar una notificación como leída' })
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
