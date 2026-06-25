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

@ApiTags('Usuario')
@Controller('usuario')
export default class UsuarioController {
  constructor(
    private readonly service: UsuarioService,
    private readonly authService: autenticacionUsuario,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiCreatedResponse({ type: registerResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async crearUsuario(
    @Body() usuario: CrearUsuarioDTO,
  ): Promise<registerResponseDto> {
    return this.authService.registrarUsuario(usuario);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login de usuario' })
  @ApiOkResponse({ description: 'Token generado correctamente' })
  @ApiBadRequestResponse({ description: 'Credenciales inválidas' })
  async login(@Body() datos: logearUsuarioDTO) {
    const token = await this.authService.logearUsuario(datos);

    return {
      accessToken: token,
    };
  }

  @UseGuards(AuthGuard, StatusGuard, RolesGuard)
  @Get()
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar usuarios (moderador/admin)' })
  @ApiOkResponse({ type: [usuarioResponseDto] })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  @ApiForbiddenResponse({ description: 'Sin permisos' })
  @Estados(estadosUsuario.ACTIVO)
  @Roles(rolUsuario.usuarioModerador, rolUsuario.usuarioAdministrador)
  async listarUsuarios(): Promise<usuarioResponseDto[]> {
    return this.service.ListarUsuarios();
  }

  @UseGuards(AuthGuard)
  @Get('mi')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener mi usuario' })
  @ApiOkResponse({ type: MiUsuarioResponseDto })
  @ApiUnauthorizedResponse()
  async obtenerMiUsuario(
    @Req() req: RequestConUsuario,
  ): Promise<MiUsuarioResponseDto> {
    return this.service.obtenerUsuarioPorId(req.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('nombre/:nombreUsuario')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Buscar usuario por nombre de usuario' })
  @ApiParam({ name: 'nombreUsuario', type: String })
  @ApiOkResponse({ type: usuarioResponseDto })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  async obtenerUsuarioPorNombreUsuario(
    @Param('nombreUsuario') nombreUsuario: string,
  ): Promise<usuarioResponseDto | null> {
    return this.service.ObtenerUsuarioPorNombreUsuario(nombreUsuario);
  }

  @UseGuards(AuthGuard, StatusGuard, RolesGuard)
  @Get(':id')
  @Estados(estadosUsuario.ACTIVO)
  @Roles(rolUsuario.usuarioAdministrador)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener usuario por ID (admin)' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: usuarioResponseDto })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  async obtenerUsuarioPorId(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<usuarioResponseDto | null> {
    return this.service.obtenerUsuarioPorId(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar mi usuario' })
  @ApiBody({ schema: { example: { contrasenia: '123456' } } })
  @ApiOkResponse({ description: 'Usuario eliminado' })
  @ApiBadRequestResponse()
  @ApiUnauthorizedResponse()
  async borrarUsuario(
    @Req() req: RequestConUsuario,
    @Body('contrasenia') contrasenia: string,
  ) {
    return this.service.EliminarUsuario(req.user.id, contrasenia);
  }

  @UseGuards(AuthGuard, StatusGuard, RolesGuard)
  @Estados(estadosUsuario.ACTIVO)
  @Roles(rolUsuario.usuarioAdministrador)
  @Delete('admin/:id')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar usuario (admin)' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Usuario eliminado por admin' })
  @ApiForbiddenResponse()
  async borrarUsuarioAdmin(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: RequestConUsuario,
  ) {
    return this.service.EliminarUsuarioAdmin(id, req.user.id);
  }

  @UseGuards(AuthGuard, StatusGuard)
  @Estados(estadosUsuario.ACTIVO)
  @Patch('actualizarUsuario')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar usuario logueado' })
  @ApiOkResponse({ type: usuarioResponseDto })
  @ApiBadRequestResponse()
  async actualizarUsuario(
    @Req() req: RequestConUsuario,
    @Body() datos: actualizarUsuarioDTO,
  ) {
    return this.service.ActualizarUsuario(req.user.id, datos);
  }

  @UseGuards(AuthGuard, StatusGuard, RolesGuard)
  @Estados(estadosUsuario.ACTIVO)
  @Roles(rolUsuario.usuarioAdministrador)
  @Patch(':id/rol')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Cambiar rol de usuario (admin)' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ description: 'Rol actualizado' })
  @ApiForbiddenResponse()
  async cambiarRolUsuario(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() datos: CambiarRolDTO,
    @Req() req: RequestConUsuario,
  ) {
    return this.service.CambiarRolUsuario(id, req.user.id, datos);
  }

  @UseGuards(AuthGuard)
  @Patch('resetearContrasenia')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Resetear contraseña' })
  @ApiOkResponse({ description: 'Contraseña actualizada' })
  async resetearContrasenia(
    @Req() req: RequestConUsuario,
    @Body() dto: actualizarContraseniaDTO,
  ) {
    return this.service.ResetearContraseniaUsuario(req.user.id, dto);
  }

  @UseGuards(AuthGuard, StatusGuard, RolesGuard)
  @Estados(estadosUsuario.ACTIVO)
  @Roles(rolUsuario.usuarioModerador, rolUsuario.usuarioAdministrador)
  @Patch(':id/bloquearUsuario')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Bloquear usuario (mod/admin)' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: usuarioBloqueadoResponseDto })
  @ApiForbiddenResponse()
  @ApiNotFoundResponse()
  async bloquearUsuario(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() datos: BloquearUsuarioDTO,
    @Req() req: RequestConUsuario,
  ) {
    return this.service.BloquearUsuario(id, req.user.id, datos);
  }
}
