import { Body, Controller, Post, Get, Param, UseGuards } from '@nestjs/common';

import { PublicacionService } from '../services/publicaciones.service';
import { CrearPublicacionDto } from '../DTOS/crearPublicacionDto';
import { Roles } from 'src/compartidos/decorators/decoratorRol';
import { RolesGuard } from 'src/compartidos/guards/rolesGuard';
import { Rol } from 'src/usuario/enums/rolUsuario';


@UseGuards(RolesGuard)
@Controller('publicaciones')
export class PublicacionController {
  constructor(private readonly publicacionService: PublicacionService) {}

  @Post()
  crearPublicacion(@Body() dto: CrearPublicacionDto) {
    return this.publicacionService.crearPublicacion(dto);
  }
  @Roles(Rol.USUARIO)
  @Get()
  listarPublicaciones() {
    return this.publicacionService.listarPublicaciones();
  }

  @Get(':id')
  buscarPublicacionPorId(@Param('id') id: string) {
    return this.publicacionService.buscarPublicacionPorId(id);
  }
}
