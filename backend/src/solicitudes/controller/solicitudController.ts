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

import { SolicitudService } from '../service/solicitudService';
import { CrearSolicitudDto } from '../DTO/crearSolicitudDto';
import { Solicitud } from '../entity/solicitudEntity';
import { AuthGuard } from 'src/usuario/auth/authGuard';
import { RechazarSolicitudDto } from '../DTO/rechazarSolicitudDto';
import { CancelarSolicitudDto } from '../DTO/cancelarSolicitudDto';
import type { RequestConUsuario } from 'src/compartidos/tipo/requestConUsuario';

@UseGuards(AuthGuard)
@Controller('solicitudes')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @Post()
  crearSolicitud(
    @Body() dto: CrearSolicitudDto,
    @Req() req: RequestConUsuario,
  ): Promise<Solicitud> {
    return this.solicitudService.crearSolicitud(dto, req.user.id);
  }

  @Get('mias')
  listarMias(@Req() req: RequestConUsuario): Promise<Solicitud[]> {
    return this.solicitudService.listarMisSolicitudes(req.user.id);
  }

  @Get('recibidas')
  listarRecibidas(@Req() req: RequestConUsuario): Promise<Solicitud[]> {
    return this.solicitudService.listarSolicitudesRecibidas(req.user.id);
  }

  @Patch(':id/aceptar')
  aceptarSolicitud(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Solicitud> {
    return this.solicitudService.aceptarSolicitud(id, req.user.id);
  }

  @Patch(':id/rechazar')
  rechazarSolicitud(
    @Param('id') id: string,
    @Body() dto: RechazarSolicitudDto,
    @Req() req: RequestConUsuario,
  ): Promise<Solicitud> {
    return this.solicitudService.rechazarSolicitud(id, req.user.id, dto);
  }

  @Patch(':id/finalizar')
  finalizarSolicitud(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Solicitud> {
    return this.solicitudService.finalizarSolicitud(id, req.user.id);
  }

  @Patch(':id/cancelar')
  cancelarSolicitud(
    @Param('id') id: string,
    @Body() dto: CancelarSolicitudDto,
    @Req() req: RequestConUsuario,
  ): Promise<Solicitud> {
    return this.solicitudService.cancelarSolicitud(id, req.user.id, dto);
  }
}
