import {
  BadRequestException,
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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { PublicacionService } from '../service/publicacionService';
import {
  buildPublicacionImagenUrl,
  publicacionUploadMulterOptions,
} from '../service/publicacionUploadService';
import { CrearPublicacionDto } from '../DTOS/crearPublicacionDto';
import { Publicacion } from '../entity/publicacionEntity';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { EditarPublicacionDto } from '../DTOS/editarPublicacionDto';
import { AuthGuard } from 'src/usuario/auth/authGuard';
import type { RequestConUsuario } from 'src/compartidos/tipo/requestConUsuario';
import { FiltrosPublicacionDto } from '../DTOS/filtrosPublicacionDto';

@Controller('publicaciones')
export class PublicacionController {
  constructor(private readonly publicacionService: PublicacionService) {}

  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('imagen', publicacionUploadMulterOptions))
  subirImagen(@UploadedFile() file: Express.Multer.File): {
    imagenUrl: string;
  } {
    if (!file) {
      throw new BadRequestException('No se recibió ninguna imagen');
    }

    return { imagenUrl: buildPublicacionImagenUrl(file.filename) };
  }

  @UseGuards(AuthGuard)
  @Post()
  crearPublicacion(
    @Body() dto: CrearPublicacionDto,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.crearPublicacion(dto, req.user.id);
  }

  @Get()
  listarFeedPublico(
    @Query() filtros: FiltrosPublicacionDto,
  ): Promise<Publicacion[]> {
    return this.publicacionService.listarPublico(filtros);
  }

  @UseGuards(AuthGuard)
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

  @UseGuards(AuthGuard)
  @Patch(':id/pausar')
  pausar(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.pausar(id, req.user.id, req.user.rol);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/reactivar')
  reactivar(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.reactivar(id, req.user.id, req.user.rol);
  }

  @UseGuards(AuthGuard)
  @Delete(':id/eliminar')
  eliminar(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.eliminar(id, req.user.id, req.user.rol);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  editar(
    @Param('id') id: string,
    @Body() dto: EditarPublicacionDto,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.editar(id, dto, req.user.id);
  }
}
