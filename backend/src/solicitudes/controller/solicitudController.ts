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
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { StatusGuard } from 'src/compartidos/guards/statusGuard';
import type { RequestConUsuario } from 'src/compartidos/tipo/requestConUsuario';
import { AuthGuard } from 'src/usuario/auth/authGuard';

import { CancelarSolicitudDto } from '../dtos/cancelarSolicitudDto';
import { CrearSolicitudDto } from '../dtos/crearSolicitudDto';
import { RechazarSolicitudDto } from '../dtos/rechazarSolicitudDto';
import { SolicitudResponseDto } from '../dtos/solicitudResponse';
import { SolicitudService } from '../service/solicitudService';

@ApiTags('Solicitudes')
@ApiBearerAuth()
@UseGuards(AuthGuard, StatusGuard)
@Controller('solicitudes')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  @Post()
  @ApiOperation({ summary: 'Crear una solicitud sobre una publicación' })
  @ApiCreatedResponse({
    description: 'Solicitud creada correctamente',
    type: SolicitudResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({
    description: 'El usuario no puede solicitar su propia publicación',
  })
  @ApiNotFoundResponse({ description: 'Publicación no encontrada' })
  @ApiConflictResponse({
    description: 'Ya existe una solicitud activa para esta publicación',
  })
  crearSolicitud(
    @Body() dto: CrearSolicitudDto,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.crearSolicitud(dto, req.user.id);
  }

  @Get('mias')
  @ApiOperation({ summary: 'Listar mis solicitudes realizadas' })
  @ApiOkResponse({
    description: 'Listado de solicitudes realizadas por el usuario autenticado',
    type: SolicitudResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  listarMias(@Req() req: RequestConUsuario): Promise<SolicitudResponseDto[]> {
    return this.solicitudService.listarMisSolicitudes(req.user.id);
  }

  @Get('recibidas')
  @ApiOperation({ summary: 'Listar solicitudes recibidas' })
  @ApiOkResponse({
    description:
      'Listado de solicitudes recibidas sobre publicaciones del usuario autenticado',
    type: SolicitudResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  listarRecibidas(
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto[]> {
    return this.solicitudService.listarSolicitudesRecibidas(req.user.id);
  }

  @Patch('publicacion/:publicacionId/entregar')
  @ApiOperation({
    summary: 'Finalizar la entrega de una publicación aceptada',
  })
  @ApiParam({
    name: 'publicacionId',
    description: 'ID de la publicación cuya entrega se quiere finalizar',
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
  })
  @ApiOkResponse({
    description: 'Entrega finalizada correctamente',
    type: SolicitudResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({
    description: 'Usuario sin permiso para finalizar esta entrega',
  })
  @ApiNotFoundResponse({
    description: 'No hay una solicitud aceptada para esta publicación',
  })
  finalizarEntregaPublicacion(
    @Param('publicacionId') publicacionId: string,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.finalizarEntregaPorPublicacion(
      publicacionId,
      req.user.id,
    );
  }

  @Patch('publicacion/:publicacionId/cancelar-reserva')
  @ApiOperation({
    summary: 'Cancelar la reserva aceptada de una publicación',
  })
  @ApiParam({
    name: 'publicacionId',
    description: 'ID de la publicación cuya reserva se quiere cancelar',
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
  })
  @ApiOkResponse({
    description: 'Reserva cancelada correctamente',
    type: SolicitudResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({
    description: 'Usuario sin permiso para cancelar esta reserva',
  })
  @ApiNotFoundResponse({
    description: 'No hay una solicitud aceptada para esta publicación',
  })
  cancelarReservaPublicacion(
    @Param('publicacionId') publicacionId: string,
    @Body() dto: CancelarSolicitudDto,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.cancelarReservaPorPublicacion(
      publicacionId,
      req.user.id,
      dto,
    );
  }

  @Patch(':id/aceptar')
  @ApiOperation({ summary: 'Aceptar una solicitud recibida' })
  @ApiParam({
    name: 'id',
    description: 'ID de la solicitud a aceptar',
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
  })
  @ApiOkResponse({
    description: 'Solicitud aceptada correctamente',
    type: SolicitudResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({
    description: 'Usuario sin permiso para aceptar esta solicitud',
  })
  @ApiNotFoundResponse({ description: 'Solicitud no encontrada' })
  @ApiConflictResponse({
    description: 'La solicitud no puede aceptarse en su estado actual',
  })
  aceptarSolicitud(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.aceptarSolicitud(id, req.user.id);
  }

  @Patch(':id/rechazar')
  @ApiOperation({ summary: 'Rechazar una solicitud recibida' })
  @ApiParam({
    name: 'id',
    description: 'ID de la solicitud a rechazar',
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
  })
  @ApiOkResponse({
    description: 'Solicitud rechazada correctamente',
    type: SolicitudResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({
    description: 'Usuario sin permiso para rechazar esta solicitud',
  })
  @ApiNotFoundResponse({ description: 'Solicitud no encontrada' })
  @ApiConflictResponse({
    description: 'La solicitud no puede rechazarse en su estado actual',
  })
  rechazarSolicitud(
    @Param('id') id: string,
    @Body() dto: RechazarSolicitudDto,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.rechazarSolicitud(id, req.user.id, dto);
  }

  @Patch(':id/finalizar')
  @ApiOperation({ summary: 'Finalizar una solicitud aceptada' })
  @ApiParam({
    name: 'id',
    description: 'ID de la solicitud a finalizar',
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
  })
  @ApiOkResponse({
    description: 'Solicitud finalizada correctamente',
    type: SolicitudResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({
    description: 'Usuario sin permiso para finalizar esta solicitud',
  })
  @ApiNotFoundResponse({ description: 'Solicitud no encontrada' })
  @ApiConflictResponse({
    description: 'La solicitud no puede finalizarse en su estado actual',
  })
  finalizarSolicitud(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.finalizarSolicitud(id, req.user.id);
  }

  @Patch(':id/cancelar')
  @ApiOperation({ summary: 'Cancelar una solicitud realizada' })
  @ApiParam({
    name: 'id',
    description: 'ID de la solicitud a cancelar',
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
  })
  @ApiOkResponse({
    description: 'Solicitud cancelada correctamente',
    type: SolicitudResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({
    description: 'Usuario sin permiso para cancelar esta solicitud',
  })
  @ApiNotFoundResponse({ description: 'Solicitud no encontrada' })
  @ApiConflictResponse({
    description: 'La solicitud no puede cancelarse en su estado actual',
  })
  cancelarSolicitud(
    @Param('id') id: string,
    @Body() dto: CancelarSolicitudDto,
    @Req() req: RequestConUsuario,
  ): Promise<SolicitudResponseDto> {
    return this.solicitudService.cancelarSolicitud(id, req.user.id, dto);
  }
}
