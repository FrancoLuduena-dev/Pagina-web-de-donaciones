import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
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

import { Roles } from '../../compartidos/decorators/decoratorRol';
import { RolesGuard } from '../../compartidos/guards/rolesGuard';
import { StatusGuard } from '../../compartidos/guards/statusGuard';
import type { RequestConUsuario } from '../../compartidos/tipo/requestConUsuario';
import { AuthGuard } from '../../usuario/auth/authGuard';
import { rolUsuario } from '../../usuario/enums/rolUsuario';
import { CrearDenunciaDto } from '../dtos/crearDenunciaDto';
import { DenunciaDetalleResponseDto } from '../dtos/denunciaDetalleResponseDto';
import { DenunciaResponseDto } from '../dtos/denunciaResponseDto';
import { FiltroDenunciaDto } from '../dtos/filtroDenunciaDto';
import { ResolverDenunciaDto } from '../dtos/resolverDenunciaDto';
import { TomarDenunciaDto } from '../dtos/tomarDenunciaDto';
import { DenunciaService } from '../service/denunciaService';

/**
 * Controlador de la API para el flujo de denuncias.
 *
 * Expone los endpoints que permiten a los usuarios reportar publicaciones
 * y a los moderadores o administradores revisar, asignar y resolver esas
 * denuncias conforme a las reglas de negocio del sistema.
 */
@ApiTags('Denuncias')
@ApiBearerAuth('access-token')
@Controller('denuncias')
@UseGuards(AuthGuard, StatusGuard, RolesGuard)
export class DenunciaController {
  constructor(private readonly denunciaService: DenunciaService) {}

  /**
   * Registra una nueva denuncia sobre una publicación.
   *
   * El usuario autenticado actúa como denunciante y el servicio valida
   * reglas de negocio clave como evitar reportes duplicados y prohibir
   * denunciar publicaciones propias.
   *
   * @param req Request con los datos del usuario autenticado.
   * @param dto Datos necesarios para crear la denuncia.
   * @returns Denuncia creada y lista para revisión.
   */
  @Post()
  @ApiOperation({ summary: 'Crear una denuncia sobre una publicación' })
  @ApiCreatedResponse({
    description: 'Denuncia creada correctamente',
    type: DenunciaResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({ description: 'Usuario sin permiso para operar' })
  crearDenuncia(
    @Req() req: RequestConUsuario,
    @Body() dto: CrearDenunciaDto,
  ): Promise<DenunciaResponseDto> {
    return this.denunciaService.crearDenuncia(req.user.id, dto);
  }

  /**
   * Lista denuncias usando filtros de búsqueda.
   *
   * Esta operación está orientada al panel de moderación, donde los
   * moderadores y administradores pueden consultar denuncias según su
   * estado y la publicación involucrada.
   *
   * @param filtros Criterios de búsqueda para filtrar denuncias.
   * @returns Lista de denuncias encontradas.
   */
  @Get()
  @Roles(rolUsuario.usuarioModerador, rolUsuario.usuarioAdministrador)
  @ApiOperation({ summary: 'Listar denuncias' })
  @ApiOkResponse({
    description: 'Listado de denuncias obtenido correctamente',
    type: DenunciaResponseDto,
    isArray: true,
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({
    description: 'Usuario sin rol de moderador o administrador',
  })
  listarDenuncias(
    @Query() filtros: FiltroDenunciaDto,
  ): Promise<DenunciaResponseDto[]> {
    return this.denunciaService.listar(filtros);
  }

  /**
   * Obtiene el detalle completo de una denuncia específica.
   *
   * Este endpoint entrega la información necesaria para que un moderador
   * pueda analizar el contexto de la denuncia antes de tomar una decisión.
   *
   * @param id Identificador de la denuncia.
   * @returns Detalle de la denuncia solicitada.
   */
  @Get(':id')
  @Roles(rolUsuario.usuarioModerador, rolUsuario.usuarioAdministrador)
  @ApiOperation({ summary: 'Obtener detalle de una denuncia' })
  @ApiParam({
    name: 'id',
    description: 'ID de la denuncia',
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
  })
  @ApiOkResponse({
    description: 'Detalle de denuncia obtenido correctamente',
    type: DenunciaDetalleResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({
    description: 'Usuario sin rol de moderador o administrador',
  })
  @ApiNotFoundResponse({ description: 'Denuncia no encontrada' })
  buscarDetalle(@Param('id') id: string): Promise<DenunciaDetalleResponseDto> {
    return this.denunciaService.buscarDetallePorId(id);
  }

  /**
   * Asigna una denuncia a un moderador para su revisión.
   *
   * Al tomar la denuncia, el sistema la mueve al estado de revisión y la
   * vincula al moderador que va a analizarla.
   *
   * @param req Request con los datos del moderador autenticado.
   * @param id Identificador de la denuncia a tomar.
   * @param dto Datos necesarios para tomar la denuncia.
   * @returns Denuncia actualizada.
   */
  @Patch(':id/tomar')
  @Roles(rolUsuario.usuarioModerador, rolUsuario.usuarioAdministrador)
  @ApiOperation({ summary: 'Tomar una denuncia para revisión' })
  @ApiParam({
    name: 'id',
    description: 'ID de la denuncia a tomar',
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
  })
  @ApiOkResponse({
    description: 'Denuncia tomada correctamente',
    type: DenunciaResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'La denuncia no puede ser tomada en su estado actual',
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({
    description: 'Usuario sin rol de moderador o administrador',
  })
  @ApiNotFoundResponse({ description: 'Denuncia no encontrada' })
  @ApiConflictResponse({
    description: 'Conflicto de concurrencia por versión desactualizada',
  })
  tomarDenuncia(
    @Req() req: RequestConUsuario,
    @Param('id') id: string,
    @Body() dto: TomarDenunciaDto,
  ): Promise<DenunciaResponseDto> {
    return this.denunciaService.tomarDenuncia(id, req.user.id, dto);
  }

  /**
   * Resuelve una denuncia ya asignada a revisión.
   *
   * El moderador puede descartar el reporte o aplicar una acción de
   * moderación sobre la publicación denunciada o sobre su creador,
   * según el tipo de resolución elegido.
   *
   * @param req Request con los datos del moderador autenticado.
   * @param id Identificador de la denuncia a resolver.
   * @param dto Datos necesarios para resolver la denuncia.
   * @returns Detalle actualizado de la denuncia resuelta.
   */
  @Patch(':id/resolver')
  @Roles(rolUsuario.usuarioModerador, rolUsuario.usuarioAdministrador)
  @ApiOperation({ summary: 'Resolver una denuncia' })
  @ApiParam({
    name: 'id',
    description: 'ID de la denuncia a resolver',
    example: 'b3b8d1c2-4a5f-4f3a-9d7e-123456789abc',
  })
  @ApiOkResponse({
    description: 'Denuncia resuelta correctamente',
    type: DenunciaDetalleResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'La denuncia no puede ser resuelta en su estado actual',
  })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  @ApiForbiddenResponse({
    description: 'Usuario sin rol de moderador o administrador',
  })
  @ApiNotFoundResponse({ description: 'Denuncia no encontrada' })
  @ApiConflictResponse({
    description: 'Conflicto de concurrencia por versión desactualizada',
  })
  resolverDenuncia(
    @Req() req: RequestConUsuario,
    @Param('id') id: string,
    @Body() dto: ResolverDenunciaDto,
  ): Promise<DenunciaDetalleResponseDto> {
    return this.denunciaService.resolverDenuncia(id, req.user.id, dto);
  }
}
