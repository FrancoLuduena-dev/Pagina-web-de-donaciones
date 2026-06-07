// src/solicitudes/controller/solicitudController.ts

import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { SolicitudService } from '../service/solicitudService';
import { CrearSolicitudDto } from '../DTO/crearSolicitudDto';
import { Solicitud } from '../entity/solicitudEntity';

const USUARIO_ID_PRUEBA = '550e8400-e29b-41d4-a716-446655440002';

@Controller('solicitudes')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @Post()
  crearSolicitud(@Body() dto: CrearSolicitudDto): Promise<Solicitud> {
    return this.solicitudService.crearSolicitud(dto, USUARIO_ID_PRUEBA);
  }

  @Get('mias')
  listarMias(): Promise<Solicitud[]> {
    return this.solicitudService.listarMisSolicitudes(USUARIO_ID_PRUEBA);
  }

  @Get('recibidas')
  listarRecibidas(): Promise<Solicitud[]> {
    return this.solicitudService.listarSolicitudesRecibidas(USUARIO_ID_PRUEBA);
  }
  @Patch(':id/aceptar')
  aceptarSolicitud(@Param('id') id: string): Promise<Solicitud> {
    return this.solicitudService.aceptarSolicitud(id, USUARIO_ID_PRUEBA);
  }
}
