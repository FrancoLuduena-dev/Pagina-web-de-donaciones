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
} from '@nestjs/common';

import { PublicacionService } from '../service/publicacionService';
import { CrearPublicacionDto } from '../DTOS/crearPublicacionDto';
import { RolesGuard } from 'src/compartidos/guards/rolesGuard';
import { Publicacion } from '../entity/publicacionEntity';
import { Rol } from 'src/enum';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { Roles } from 'src/compartidos/decorators/decoratorRol';
import { EditarPublicacionDto } from '../DTOS/editarPublicacionDto';

const USUARIO_ID_PRUEBA = '550e8400-e29b-41d4-a716-446655440002';
const ROL_PRUEBA = Rol.MODERADOR;

@UseGuards(RolesGuard)
@Controller('publicaciones')
export class PublicacionController {
  constructor(private readonly publicacionService: PublicacionService) {}

  @Post()
  crearPublicacion(@Body() dto: CrearPublicacionDto): Promise<Publicacion> {
    return this.publicacionService.crearPublicacion(dto);
  }

  @Get()
  listarFeedPublico(): Promise<Publicacion[]> {
    return this.publicacionService.listarPublico();
  }

  @Roles(Rol.USUARIO)
  @Get('me')
  listarMisPublicaciones(
    @Query('estado') estado?: EstadoPublicacion,
  ): Promise<Publicacion[]> {
    return this.publicacionService.listarMisPublicaciones(
      USUARIO_ID_PRUEBA,
      estado,
    );
  }

  @Get(':id')
  buscarPublicacionPorId(@Param('id') id: string): Promise<Publicacion> {
    return this.publicacionService.buscarPublicacionPorId(id);
  }

  @Patch(':id/pausar')
  pausar(@Param('id') id: string): Promise<Publicacion> {
    return this.publicacionService.pausar(id, USUARIO_ID_PRUEBA, ROL_PRUEBA);
  }

  @Patch(':id/reactivar')
  reactivar(@Param('id') id: string): Promise<Publicacion> {
    return this.publicacionService.reactivar(id, USUARIO_ID_PRUEBA, ROL_PRUEBA);
  }

  @Patch(':id/entregar')
  entregar(@Param('id') id: string): Promise<Publicacion> {
    return this.publicacionService.entregar(id, USUARIO_ID_PRUEBA);
  }

  @Delete(':id/eliminar')
  eliminar(@Param('id') id: string): Promise<Publicacion> {
    return this.publicacionService.eliminar(id, USUARIO_ID_PRUEBA, ROL_PRUEBA);
  }

  @Patch(':id')
  editar(
    @Param('id') id: string,
    @Body() dto: EditarPublicacionDto,
  ): Promise<Publicacion> {
    return this.publicacionService.editar(id, dto, USUARIO_ID_PRUEBA);
  }
}
