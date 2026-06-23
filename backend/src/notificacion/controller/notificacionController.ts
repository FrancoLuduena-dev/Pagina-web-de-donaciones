import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import { StatusGuard } from '../../compartidos/guards/statusGuard';
import type { RequestConUsuario } from '../../compartidos/tipo/requestConUsuario';
import { AuthGuard } from '../../usuario/auth/authGuard';
import { CantidadNoLeidasResponseDto } from '../dtos/cantidadNoLeidasResponseDto';
import { ListadoNotificacionesResponseDto } from '../dtos/listadoNotificacionesResponseDto';
import { NotificacionResponseDto } from '../dtos/notificacionResponseDto';
import { PaginacionNotificacionDto } from '../dtos/paginacionNotificacionDto';
import { NotificacionService } from '../service/notificacionService';

@Controller('notificaciones')
@UseGuards(AuthGuard, StatusGuard)
export class NotificacionController {
  constructor(private readonly notificacionService: NotificacionService) {}

  @Get()
  listarPropias(
    @Req() req: RequestConUsuario,
    @Query() paginacion: PaginacionNotificacionDto,
  ): Promise<ListadoNotificacionesResponseDto> {
    return this.notificacionService.listarPropias(req.user.id, paginacion);
  }

  @Get('no-leidas/cantidad')
  async contarNoLeidas(
    @Req() req: RequestConUsuario,
  ): Promise<CantidadNoLeidasResponseDto> {
    const cantidad = await this.notificacionService.contarNoLeidas(req.user.id);

    return { cantidad };
  }

  @Patch('marcar-todas-leidas')
  async marcarTodasComoLeidas(@Req() req: RequestConUsuario): Promise<void> {
    await this.notificacionService.marcarTodasComoLeidas(req.user.id);
  }

  @Patch(':id/marcar-leida')
  marcarComoLeida(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<NotificacionResponseDto> {
    return this.notificacionService.marcarComoLeida(id, req.user.id);
  }
}
