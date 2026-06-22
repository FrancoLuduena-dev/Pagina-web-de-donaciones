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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import { PublicacionService } from '../service/publicacionService';
import {
  buildPublicacionImagenUrl,
  MAX_IMAGENES_PUBLICACION,
  publicacionUploadMulterOptions,
} from '../service/publicacionUploadService';
import { CrearPublicacionDto } from '../dtos/crearPublicacionDto';
import { Publicacion } from '../entity/publicacionEntity';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { EditarPublicacionDto } from '../dtos/editarPublicacionDto';
import { AuthGuard } from 'src/usuario/auth/authGuard';
import type { RequestConUsuario } from 'src/compartidos/tipo/requestConUsuario';
import { FiltrosPublicacionDto } from '../dtos/filtrosPublicacionDto';

@Controller('publicaciones')
export class PublicacionController {
  constructor(private readonly publicacionService: PublicacionService) {}

  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor(
      'imagenes',
      MAX_IMAGENES_PUBLICACION,
      publicacionUploadMulterOptions,
    ),
  )
  subirImagenes(@UploadedFiles() files: Express.Multer.File[]): {
    imagenUrls: string[];
  } {
    if (!files?.length) {
      throw new BadRequestException('No se recibió ninguna imagen');
    }

    return {
      imagenUrls: files.map((file) => buildPublicacionImagenUrl(file.filename)),
    };
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
  buscarPublicacionPorId(@Param('id') id: string) {
    return this.publicacionService.buscarPublicacionPorIdConCreador(id);
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
