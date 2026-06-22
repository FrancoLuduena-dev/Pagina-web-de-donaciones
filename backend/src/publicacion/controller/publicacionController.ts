import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';

import type { RequestConUsuario } from 'src/compartidos/tipo/requestConUsuario';
import { StatusGuard } from 'src/compartidos/guards/statusGuard';
import { AuthGuard } from 'src/usuario/auth/authGuard';

import { CrearPublicacionDto } from '../dtos/crearPublicacionDto';
import { EditarPublicacionDto } from '../dtos/editarPublicacionDto';
import { FiltrosPublicacionDto } from '../dtos/filtrosPublicacionDto';
import { Publicacion } from '../entity/publicacionEntity';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { PublicacionService } from '../service/publicacionService';
import {
  buildPublicacionImagenUrl,
  MAX_IMAGENES_PUBLICACION,
  publicacionUploadMulterOptions,
  validarImagenesSubidas,
} from '../service/publicacionUploadService';

@Controller('publicaciones')
export class PublicacionController {
  constructor(private readonly publicacionService: PublicacionService) {}

  @UseGuards(AuthGuard, StatusGuard)
  @Post('upload')
  @UseInterceptors(
    FilesInterceptor(
      'imagenes',
      MAX_IMAGENES_PUBLICACION,
      publicacionUploadMulterOptions,
    ),
  )
  async subirImagenes(
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<{ imagenUrls: string[] }> {
    if (!files?.length) {
      throw new BadRequestException('No se recibió ninguna imagen');
    }

    await validarImagenesSubidas(files);

    return {
      imagenUrls: files.map((file) => buildPublicacionImagenUrl(file.filename)),
    };
  }

  @UseGuards(AuthGuard, StatusGuard)
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

  @UseGuards(AuthGuard, StatusGuard)
  @Patch(':id/pausar')
  pausar(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.pausar(id, req.user.id, req.user.rol);
  }

  @UseGuards(AuthGuard, StatusGuard)
  @Patch(':id/reactivar')
  reactivar(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.reactivar(id, req.user.id, req.user.rol);
  }

  @UseGuards(AuthGuard, StatusGuard)
  @Delete(':id/eliminar')
  eliminar(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.eliminar(id, req.user.id, req.user.rol);
  }

  @UseGuards(AuthGuard, StatusGuard)
  @Patch(':id')
  editar(
    @Param('id') id: string,
    @Body() dto: EditarPublicacionDto,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.editar(id, dto, req.user.id);
  }
}
