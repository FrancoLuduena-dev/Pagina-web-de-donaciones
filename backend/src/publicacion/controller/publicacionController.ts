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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

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

@ApiTags('Publicaciones')
@Controller('publicaciones')
export class PublicacionController {
  constructor(private readonly publicacionService: PublicacionService) {}

  @UseGuards(AuthGuard, StatusGuard)
  @Post('upload')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subir imágenes para una publicación' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Imágenes de la publicación',
    schema: {
      type: 'object',
      properties: {
        imagenes: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      required: ['imagenes'],
    },
  })
  @ApiCreatedResponse({
    description: 'Imágenes subidas correctamente',
    schema: {
      example: {
        imagenUrls: ['/uploads/publicaciones/imagen-123.jpg'],
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'No se recibieron imágenes o las imágenes no son válidas',
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({ description: 'Usuario sin permiso para operar' })
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
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Crear una publicación' })
  @ApiCreatedResponse({
    description: 'Publicación creada correctamente',
    type: Publicacion,
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({ description: 'Usuario sin permiso para operar' })
  crearPublicacion(
    @Body() dto: CrearPublicacionDto,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.crearPublicacion(dto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Listar publicaciones públicas disponibles' })
  @ApiOkResponse({
    description: 'Listado público de publicaciones obtenido correctamente',
    type: Publicacion,
    isArray: true,
  })
  listarFeedPublico(
    @Query() filtros: FiltrosPublicacionDto,
  ): Promise<Publicacion[]> {
    return this.publicacionService.listarPublico(filtros);
  }

  @UseGuards(AuthGuard)
  @Get('mias')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar mis publicaciones' })
  @ApiQuery({
    name: 'estado',
    enum: EstadoPublicacion,
    required: false,
    description: 'Estado por el cual filtrar las publicaciones propias',
  })
  @ApiOkResponse({
    description: 'Listado de publicaciones del usuario autenticado',
    type: Publicacion,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  listarMisPublicaciones(
    @Req() req: RequestConUsuario,
    @Query('estado') estado?: EstadoPublicacion,
  ): Promise<Publicacion[]> {
    return this.publicacionService.listarMisPublicaciones(req.user.id, estado);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar publicación por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID de la publicación',
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
  })
  @ApiOkResponse({
    description: 'Publicación encontrada',
    type: Publicacion,
  })
  buscarPublicacionPorId(@Param('id') id: string) {
    return this.publicacionService.buscarPublicacionPorIdConCreador(id);
  }

  @UseGuards(AuthGuard, StatusGuard)
  @Patch(':id/pausar')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Pausar una publicación' })
  @ApiParam({
    name: 'id',
    description: 'ID de la publicación a pausar',
  })
  @ApiOkResponse({
    description: 'Publicación pausada correctamente',
    type: Publicacion,
  })
  @ApiBadRequestResponse({ description: 'La publicación no puede pausarse' })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({ description: 'Usuario sin permiso para operar' })
  pausar(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.pausar(id, req.user.id, req.user.rol);
  }

  @UseGuards(AuthGuard, StatusGuard)
  @Patch(':id/reactivar')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reactivar una publicación' })
  @ApiParam({
    name: 'id',
    description: 'ID de la publicación a reactivar',
  })
  @ApiOkResponse({
    description: 'Publicación reactivada correctamente',
    type: Publicacion,
  })
  @ApiBadRequestResponse({ description: 'La publicación no puede reactivarse' })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({ description: 'Usuario sin permiso para operar' })
  reactivar(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.reactivar(id, req.user.id, req.user.rol);
  }

  @UseGuards(AuthGuard, StatusGuard)
  @Delete(':id/eliminar')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Eliminar una publicación' })
  @ApiParam({
    name: 'id',
    description: 'ID de la publicación a eliminar',
  })
  @ApiOkResponse({
    description: 'Publicación eliminada correctamente',
    type: Publicacion,
  })
  @ApiBadRequestResponse({ description: 'La publicación no puede eliminarse' })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({ description: 'Usuario sin permiso para operar' })
  eliminar(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.eliminar(id, req.user.id, req.user.rol);
  }

  @UseGuards(AuthGuard, StatusGuard)
  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Editar una publicación' })
  @ApiParam({
    name: 'id',
    description: 'ID de la publicación a editar',
  })
  @ApiOkResponse({
    description: 'Publicación editada correctamente',
    type: Publicacion,
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({ description: 'Usuario sin permiso para operar' })
  editar(
    @Param('id') id: string,
    @Body() dto: EditarPublicacionDto,
    @Req() req: RequestConUsuario,
  ): Promise<Publicacion> {
    return this.publicacionService.editar(id, dto, req.user.id);
  }
}
