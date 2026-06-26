import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';

import { Request } from 'express';

import UsuarioService from '../service/usuarioService';
import CrearUsuarioDTO from '../dtos/usuarioDto';
import Usuario from '../entity/usuarioEntity';
import autenticacionUsuario from '../auth/authUsuario';
import { BloquearUsuarioDTO } from '../dtos/bloquearUsuarioDto';
import actualizarUsuarioDTO from '../dtos/actualizarUsuarioDto';
import { CambiarRolDTO } from '../dtos/cambiarRolDto';
import logearUsuarioDTO from '../dtos/logearUsuarioDto';
import actualizarContraseniaDTO from '../dtos/actualizarContraseniaDto';
import registerResponseDto from '../dtos/registerResponseDto';
import usuarioResponseDto from '../dtos/usuarioResponseDto';
import { ParseUUIDPipe } from '@nestjs/common';
import usuarioBloqueadoResponseDto from '../dtos/usuarioBloqueadoResponseDto';

import { AuthGuard } from '../auth/authGuard';
import { Roles } from 'src/compartidos/decorators/decoratorRol';
import { RolesGuard } from 'src/compartidos/guards/rolesGuard';

import { rolUsuario } from '../enums/rolUsuario';
import { MiUsuarioResponseDto } from '../dtos/miUsuarioResponseDto';
import { StatusGuard } from '../../compartidos/guards/statusGuard';
import { Estados } from 'src/compartidos/decorators/decoratorEstados';
import { estadosUsuario } from '../enums/estadosUsuario';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

interface RequestConUsuario extends Request {
  user: Usuario;
}

/** * Controlador encargado de exponer los endpoints HTTP relacionados a usuarios. * 
 * * Responsabilidades: * 
 * - Recibir requests HTTP * 
 * - Validar DTOs (mediante pipes) * 
 * - Aplicar guards (auth, roles, estado) * 
 * - Delegar la lógica al service * 
 * - Formatear respuestas */

@ApiTags('Usuario')
@Controller('usuario')
export default class UsuarioController {
  constructor(
    private readonly service: UsuarioService,
    private readonly authService: autenticacionUsuario,
  ) {}

  /** * Registro de usuario. * 
   * * Endpoint público. * * 
   * @route POST /usuario */

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo usuario' }) 
  @ApiCreatedResponse({ description: 'Usuario registrado correctamente', type: registerResponseDto, }) 
  @ApiBadRequestResponse({ description: 'Datos inválidos o incompletos' })
  async crearUsuario(
    @Body() usuario: CrearUsuarioDTO,
  ): Promise<registerResponseDto> {
    return this.authService.registrarUsuario(usuario);
  }

  /** * Login de usuario. * 
   * * Endpoint público. * 
   * Devuelve JWT. * * 
   * @route POST /usuario/login */

  @Post('login')
  @ApiOperation({ summary: 'Login de usuario' }) 
  @ApiOkResponse({ description: 'Token generado correctamente', schema: { example: { accessToken: 'jwt.token.aqui' } }, }) 
  @ApiBadRequestResponse({ description: 'Credenciales inválidas' })
  async login(@Body() datos: logearUsuarioDTO) {
    const token = await this.authService.logearUsuario(datos);

    return {
      accessToken: token,
    };
  }

  /** * Lista todos los usuarios. * 
   * * Requiere: * 
   * - Usuario autenticado * 
   * - Estado ACTIVO * 
   * - Rol MODERADOR o ADMIN * * 
   * @route GET /usuario */

  @UseGuards(AuthGuard, StatusGuard, RolesGuard)
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar usuarios (moderador/admin)' })
  @ApiOkResponse({ description: 'Listado de usuarios obtenido correctamente', type: usuarioResponseDto, isArray: true, })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'Sin permisos' })
  @Estados(estadosUsuario.ACTIVO)
  @Roles(rolUsuario.usuarioModerador, rolUsuario.usuarioAdministrador)
  async listarUsuarios(): Promise<usuarioResponseDto[]> {
    return this.service.ListarUsuarios();
  }

  /** * Obtiene el usuario autenticado. *
   *  * @route GET /usuario/mi */

  @UseGuards(AuthGuard)
  @Get('mi')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener mi usuario' })
  @ApiOkResponse({ description: 'Usuario autenticado obtenido correctamente', type: MiUsuarioResponseDto })
  @ApiUnauthorizedResponse({ description: 'Usuario no autenticado' })
  async obtenerMiUsuario(
    @Req() req: RequestConUsuario,
  ): Promise<MiUsuarioResponseDto> {
    return this.service.obtenerUsuarioPorId(req.user.id);
  }

  /** * Busca un usuario por nombre de usuario. * * 
   * @route GET /usuario/nombre/:nombreUsuario */

  @UseGuards(AuthGuard)
  @Get('nombre/:nombreUsuario')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Buscar usuario por nombre de usuario' }) 
  @ApiParam({ name: 'nombreUsuario', description: 'Nombre de usuario a buscar', }) 
  @ApiOkResponse({ description: 'Usuario encontrado', type: usuarioResponseDto, }) 
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async obtenerUsuarioPorNombreUsuario(
    @Param('nombreUsuario') nombreUsuario: string,
  ): Promise<usuarioResponseDto | null> {
    return this.service.ObtenerUsuarioPorNombreUsuario(nombreUsuario);
  }

  /** * Obtiene un usuario por ID (solo admin). * * 
   * @route GET /usuario/:id */

  @UseGuards(AuthGuard, StatusGuard, RolesGuard)
  @Get(':id')
  @Estados(estadosUsuario.ACTIVO)
  @Roles(rolUsuario.usuarioAdministrador)
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Obtener usuario por ID (admin)' }) 
  @ApiParam({ name: 'id', description: 'ID del usuario', example: 'uuid-del-usuario', }) 
  @ApiOkResponse({ description: 'Usuario encontrado', type: usuarioResponseDto, }) 
  @ApiForbiddenResponse({ description: 'Sin permisos' }) 
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async obtenerUsuarioPorId(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<usuarioResponseDto | null> {
    return this.service.obtenerUsuarioPorId(id);
  }

  /** * Elimina el usuario autenticado. * 
   * * Requiere contraseña para confirmar. * * 
   * @route DELETE /usuario/:id */

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Eliminar mi usuario' }) 
  @ApiBody({ schema: { example: { contrasenia: '123456' }, }, }) 
  @ApiOkResponse({ description: 'Usuario eliminado correctamente' }) 
  @ApiBadRequestResponse({ description: 'Contraseña incorrecta' })
  async borrarUsuario(
    @Req() req: RequestConUsuario,
    @Body('contrasenia') contrasenia: string,
  ) {
    return this.service.EliminarUsuario(req.user.id, contrasenia);
  }

  /** * Elimina un usuario como administrador. * * 
   * @route DELETE /usuario/admin/:id */

  @UseGuards(AuthGuard, StatusGuard, RolesGuard)
  @Estados(estadosUsuario.ACTIVO)
  @Roles(rolUsuario.usuarioAdministrador)
  @Delete('admin/:id')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Eliminar usuario (admin)' }) 
  @ApiParam({ name: 'id', description: 'ID del usuario a eliminar', }) 
  @ApiOkResponse({ description: 'Usuario eliminado por administrador' }) 
  @ApiForbiddenResponse({ description: 'Sin permisos' })
  async borrarUsuarioAdmin(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: RequestConUsuario,
  ) {
    return this.service.EliminarUsuarioAdmin(id, req.user.id);
  }

  /** * Actualiza datos del usuario autenticado. * 
   * @route PATCH /usuario/actualizarUsuario */

  @UseGuards(AuthGuard, StatusGuard)
  @Estados(estadosUsuario.ACTIVO)
  @Patch('actualizarUsuario')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Actualizar usuario logueado' })
  @ApiOkResponse({ description: 'Usuario actualizado correctamente', type: usuarioResponseDto, }) 
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async actualizarUsuario(
    @Req() req: RequestConUsuario,
    @Body() datos: actualizarUsuarioDTO,
  ) {
    return this.service.ActualizarUsuario(req.user.id, datos);
  }

  /** * Cambia el rol de un usuario (solo admin). * 
   * * @route PATCH /usuario/:id/rol */

  @UseGuards(AuthGuard, StatusGuard, RolesGuard)
  @Estados(estadosUsuario.ACTIVO)
  @Roles(rolUsuario.usuarioAdministrador)
  @Patch(':id/rol')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Cambiar rol de usuario (admin)' }) 
  @ApiParam({ name: 'id', description: 'ID del usuario a modificar', }) 
  @ApiOkResponse({ description: 'Rol actualizado correctamente' }) 
  @ApiForbiddenResponse({ description: 'Sin permisos' })
  async cambiarRolUsuario(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() datos: CambiarRolDTO,
    @Req() req: RequestConUsuario,
  ) {
    return this.service.CambiarRolUsuario(id, req.user.id, datos);
  }

  /** * Permite al usuario cambiar su contraseña. * * 
   * @route PATCH /usuario/resetearContrasenia */

  @UseGuards(AuthGuard)
  @Patch('resetearContrasenia')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Resetear contraseña' }) 
  @ApiOkResponse({ description: 'Contraseña actualizada correctamente' }) 
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async resetearContrasenia(
    @Req() req: RequestConUsuario,
    @Body() dto: actualizarContraseniaDTO,
  ) {
    return this.service.ResetearContraseniaUsuario(req.user.id, dto);
  }

  /** * Bloquea un usuario. *
   *  * Requiere rol MODERADOR o ADMIN. * * 
   * @route PATCH /usuario/:id/bloquearUsuario */
  
  @UseGuards(AuthGuard, StatusGuard, RolesGuard)
  @Estados(estadosUsuario.ACTIVO)
  @Roles(rolUsuario.usuarioModerador, rolUsuario.usuarioAdministrador)
  @Patch(':id/bloquearUsuario')
  @ApiBearerAuth('access-token') 
  @ApiOperation({ summary: 'Bloquear usuario (mod/admin)' }) 
  @ApiParam({ name: 'id', description: 'ID del usuario a bloquear', }) 
  @ApiOkResponse({ description: 'Usuario bloqueado correctamente', type: usuarioBloqueadoResponseDto, }) 
  @ApiForbiddenResponse({ description: 'Sin permisos' }) 
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async bloquearUsuario(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() datos: BloquearUsuarioDTO,
    @Req() req: RequestConUsuario,
  ) {
    return this.service.BloquearUsuario(id, req.user.id, datos);
  }
}
