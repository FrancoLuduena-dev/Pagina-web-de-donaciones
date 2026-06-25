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

/**
 * Controlador que expone los endpoints para gestionar solicitudes sobre publicaciones.
 *
 * Recibe las peticiones HTTP, delega la lógica de negocio al servicio y deja
 * en Swagger la semántica de cada operación para el frontend y la documentación académica.
 */
@ApiTags('Solicitudes')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, StatusGuard)
@Controller('solicitudes')
export class SolicitudController {
  constructor(private readonly solicitudService: SolicitudService) {}

  /**
   * Crea una solicitud sobre una publicación.
   *
   * Requiere autenticación y delega la validación de negocio al servicio,
   * incluyendo la comprobación de que la publicación acepte solicitudes y que
   * el usuario no sea el creador de la misma.
   */
  @Post()
  @ApiOperation({
    summary: 'Crear una solicitud sobre una publicación',
    description:
      'Permite a un usuario autenticado enviar una solicitud sobre una publicación, siempre que el flujo de negocio lo permita.',
  })
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

  /**
   * Lista las solicitudes realizadas por el usuario autenticado.
   *
   * Útil para consultar el estado de las solicitudes propias y su evolución.
   */
  @Get('mias')
  @ApiOperation({
    summary: 'Listar mis solicitudes realizadas',
    description:
      'Devuelve las solicitudes enviadas por el usuario autenticado, incluyendo su estado actual.',
  })
  @ApiOkResponse({
    description: 'Listado de solicitudes realizadas por el usuario autenticado',
    type: SolicitudResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  listarMias(@Req() req: RequestConUsuario): Promise<SolicitudResponseDto[]> {
    return this.solicitudService.listarMisSolicitudes(req.user.id);
  }

  /**
   * Lista las solicitudes recibidas por el usuario autenticado sobre sus publicaciones.
   *
   * Permite al creador revisar y gestionar las solicitudes que otros usuarios
   * le han enviado sobre sus publicaciones.
   */
  @Get('recibidas')
  @ApiOperation({
    summary: 'Listar solicitudes recibidas',
    description:
      'Devuelve las solicitudes recibidas por el usuario autenticado sobre sus publicaciones.',
  })
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

  /**
   * Finaliza la entrega de una publicación cuyo proceso ya fue aceptado.
   *
   * El endpoint delega en el servicio la finalización del flujo y la resolución
   * de solicitudes pendientes asociadas a la misma publicación.
   */
  @Patch('publicacion/:publicacionId/entregar')
  @ApiOperation({
    summary: 'Finalizar la entrega de una publicación aceptada',
    description:
      'Finaliza el proceso de entrega asociado a una solicitud aceptada sobre una publicación.',
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

  /**
   * Cancela la reserva de una publicación vinculada a una solicitud aceptada.
   *
   * Esta operación permite liberar la publicación cuando la reserva deja de ser válida.
   */
  @Patch('publicacion/:publicacionId/cancelar-reserva')
  @ApiOperation({
    summary: 'Cancelar la reserva aceptada de una publicación',
    description:
      'Libera la reserva de una publicación cuando se cancela una solicitud aceptada.',
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

  /**
   * Acepta una solicitud recibida por el creador de la publicación.
   *
   * La operación representa comprometer la publicación con el solicitante y
   * delega la actualización de estados y publicación al servicio.
   */
  @Patch(':id/aceptar')
  @ApiOperation({
    summary: 'Aceptar una solicitud recibida',
    description:
      'Acepta una solicitud pendiente del flujo de negocio y actualiza el estado correspondiente.',
  })
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

  /**
   * Rechaza una solicitud pendiente.
   *
   * El creador de la publicación puede rechazar la solicitud y aportar un motivo.
   */
  @Patch(':id/rechazar')
  @ApiOperation({
    summary: 'Rechazar una solicitud recibida',
    description:
      'Rechaza una solicitud pendiente y permite incluir un motivo opcional para el rechazo.',
  })
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

  /**
   * Finaliza una solicitud aceptada que ya pasó por el proceso de entrega.
   *
   * El servicio resuelve el cierre del flujo y deja la solicitud en un estado terminal.
   */
  @Patch(':id/finalizar')
  @ApiOperation({
    summary: 'Finalizar una solicitud aceptada',
    description:
      'Finaliza una solicitud aceptada cuando el proceso de entrega o intercambio concluyó.',
  })
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

  /**
   * Cancela una solicitud realizada por el usuario autenticado.
   *
   * El comportamiento depende del estado actual de la solicitud: pendiente o aceptada.
   */
  @Patch(':id/cancelar')
  @ApiOperation({
    summary: 'Cancelar una solicitud realizada',
    description:
      'Cancela una solicitud pendiente o aceptada, según el estado vigente y las reglas del negocio.',
  })
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
