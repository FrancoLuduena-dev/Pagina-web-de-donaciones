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

import type { RequestConUsuario } from 'src/compartidos/tipo/requestConUsuario';
import { StatusGuard } from 'src/compartidos/guards/statusGuard';
import { AuthGuard } from 'src/usuario/auth/authGuard';

import { CancelarSolicitudDto } from '../dtos/cancelarSolicitudDto';
import { CrearSolicitudDto } from '../dtos/crearSolicitudDto';
import { RechazarSolicitudDto } from '../dtos/rechazarSolicitudDto';
import { SolicitudResponseDto } from '../dtos/solicitudResponse';
import { SolicitudService } from '../service/solicitudService';

@UseGuards(AuthGuard)
@Controller('solicitudes')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @UseGuards(StatusGuard)
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

  @UseGuards(StatusGuard)
  @Patch(':id/aceptar')
  aceptarSolicitud(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.aceptarSolicitud(id, req.user.id);
  }

  @UseGuards(StatusGuard)
  @Patch(':id/rechazar')
  rechazarSolicitud(
    @Param('id') id: string,
    @Body() dto: RechazarSolicitudDto,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.rechazarSolicitud(id, req.user.id, dto);
  }

  @UseGuards(StatusGuard)
  @Patch(':id/finalizar')
  finalizarSolicitud(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.finalizarSolicitud(id, req.user.id);
  }

  @UseGuards(StatusGuard)
  @Patch(':id/cancelar')
  cancelarSolicitud(
    @Param('id') id: string,
    @Body() dto: CancelarSolicitudDto,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.cancelarSolicitud(id, req.user.id, dto);
  }
}
