import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { StatusGuard } from 'src/compartidos/guards/statusGuard';
import type { RequestConUsuario } from 'src/compartidos/tipo/requestConUsuario';
import { AuthGuard } from 'src/usuario/auth/authGuard';

import { CancelarSolicitudDto } from '../dtos/cancelarSolicitudDto';
import { CrearSolicitudDto } from '../dtos/crearSolicitudDto';
import { RechazarSolicitudDto } from '../dtos/rechazarSolicitudDto';
import { SolicitudResponseDto } from '../dtos/solicitudResponse';
import { SolicitudService } from '../service/solicitudService';

@UseGuards(AuthGuard, StatusGuard)
@Controller('solicitudes')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @Post()
  crearSolicitud(
    @Body() dto: CrearSolicitudDto,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.crearSolicitud(dto, req.user.id);
  }

  @Get('mias')
  listarMias(@Req() req: RequestConUsuario): Promise<SolicitudResponseDto[]> {
    return this.solicitudService.listarMisSolicitudes(req.user.id);
  }

  @Get('recibidas')
  listarRecibidas(
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto[]> {
    return this.solicitudService.listarSolicitudesRecibidas(req.user.id);
  }

  @Patch('publicacion/:publicacionId/entregar')
  finalizarEntregaPublicacion(
    @Param('publicacionId') publicacionId: string,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.finalizarEntregaPorPublicacion(
      publicacionId,
      req.user.id,
    );
  }

  @Patch('publicacion/:publicacionId/cancelar-reserva')
  cancelarReservaPublicacion(
    @Param('publicacionId') publicacionId: string,
    @Body() dto: CancelarSolicitudDto,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.cancelarReservaPorPublicacion(
      publicacionId,
      req.user.id,
      dto,
    );
  }

  @Patch(':id/aceptar')
  aceptarSolicitud(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.aceptarSolicitud(id, req.user.id);
  }

  @Patch(':id/rechazar')
  rechazarSolicitud(
    @Param('id') id: string,
    @Body() dto: RechazarSolicitudDto,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.rechazarSolicitud(id, req.user.id, dto);
  }

  @Patch(':id/finalizar')
  finalizarSolicitud(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.finalizarSolicitud(id, req.user.id);
  }

  @Patch(':id/cancelar')
  cancelarSolicitud(
    @Param('id') id: string,
    @Body() dto: CancelarSolicitudDto,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.cancelarSolicitud(id, req.user.id, dto);
  }
}
