import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  Query,
  Delete,
  Req,
} from '@nestjs/common';

import { Request } from 'express';
import { PublicacionService } from '../service/publicacionService';
import { CrearPublicacionDto } from '../dtos/crearPublicacionDto';
import { Publicacion } from '../entity/publicacionEntity';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { EditarPublicacionDto } from '../dtos/editarPublicacionDto';
import { Roles } from 'src/compartidos/decorators/decoratorRol';
import { AuthGuard } from 'src/usuario/auth/authGuard';
import { RolesGuard } from 'src/compartidos/guards/rolesGuard';
import { rolUsuario } from 'src/usuario/enums/rolUsuario';

interface RequestConUsuario extends Request {
  user: {
    id: string;
    rol: rolUsuario;
  };
}

@UseGuards(AuthGuard, RolesGuard)
@Controller('publicaciones')
export class PublicacionController {
  constructor(private readonly publicacionService: PublicacionService) {}

  @Post()
  crearPublicacion(
    @Body() dto: CrearPublicacionDto,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.crearPublicacion(dto, req.user.id);
  }

  @Get()
  listarFeedPublico(): Promise<Publicacion[]> {
    return this.publicacionService.listarPublico();
  }

  @Roles(rolUsuario.usuarioNormal)
  @Get('mias')
  listarMisPublicaciones(
    @Req() req: RequestConUsuario,
    @Query('estado') estado?: EstadoPublicacion,
  ): Promise<Publicacion[]> {
    return this.publicacionService.listarMisPublicaciones(req.user.id, estado);
  }

  @Get(':id')
  buscarPublicacionPorId(@Param('id') id: string): Promise<Publicacion> {
    return this.publicacionService.buscarPublicacionPorId(id);
  }

  @Patch(':id/pausar')
  pausar(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.pausar(id, req.user.id, req.user.rol);
  }

  @Patch(':id/reactivar')
  reactivar(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.reactivar(id, req.user.id, req.user.rol);
  }

  @Patch(':id/entregar')
  entregar(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.entregar(id, req.user.id);
  }

  @Delete(':id/eliminar')
  eliminar(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.eliminar(id, req.user.id, req.user.rol);
  }

  @Patch(':id')
  editar(
    @Param('id') id: string,
    @Body() dto: EditarPublicacionDto,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.editar(id, dto, req.user.id);
  }
}
