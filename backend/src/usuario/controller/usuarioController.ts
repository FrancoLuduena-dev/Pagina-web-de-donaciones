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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';

import UsuarioService from '../service/usuarioService';
import CrearUsuarioDTO from '../dtos/usuarioDto';
import autenticacionUsuario from '../auth/authUsuario';
import { BloquearUsuarioDTO } from '../dtos/bloquearUsuarioDto';
import actualizarUsuarioDTO from '../dtos/actualizarUsuarioDto';
import { CambiarRolDTO } from '../dtos/cambiarRolDto';
import logearUsuarioDTO from '../dtos/logearUsuarioDto';
import actualizarContraseniaDTO from '../dtos/actualizarContraseniaDto';
import registerResponseDto from '../dtos/registerResponseDto';
import usuarioResponseDto from '../dtos/usuarioResponseDto';
import { ParseUUIDPipe } from '@nestjs/common';
import { AuthGuard } from '../auth/authGuard';
import { RolesGuard } from 'src/compartidos/guards/rolesGuard';
import { StatusGuard } from '../../compartidos/guards/statusGuard';
import { MiUsuarioResponseDto } from '../dtos/miUsuarioResponseDto';

interface RequestConUsuario extends Request {
  user: any;
}

@ApiTags('Usuarios')
@Controller('usuario')
export default class UsuarioController {
  constructor(
    private readonly service: UsuarioService,
    private readonly authService: autenticacionUsuario,
  ) { }

  @Post()
  @ApiOperation({ summary: 'Registrar usuario' })
  @ApiBody({ type: CrearUsuarioDTO })
  @ApiCreatedResponse({ description: 'Usuario creado', type: registerResponseDto })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async crearUsuario(@Body() usuario: CrearUsuarioDTO): Promise<registerResponseDto> {
    return this.authService.registrarUsuario(usuario);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login de usuario' })
  @ApiBody({ type: logearUsuarioDTO })
  @ApiOkResponse({ description: 'JWT generado correctamente' })
  @ApiUnauthorizedResponse({ description: 'Credenciales inválidas' })
  async login(@Body() datos: logearUsuarioDTO) {
    const token = await this.authService.logearUsuario(datos);
    return { accessToken: token };
  }

  @UseGuards(AuthGuard, StatusGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Get()
  @ApiOperation({ summary: 'Listar usuarios (admin/moderador)' })
  @ApiOkResponse({ type: [usuarioResponseDto] })
  @ApiUnauthorizedResponse({ description: 'Token inválido o faltante' })
  @ApiForbiddenResponse({ description: 'Sin permisos' })
  async listarUsuarios(): Promise<usuarioResponseDto[]> {
    return this.service.ListarUsuarios();
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @Get('mi')
  @ApiOperation({ summary: 'Obtener usuario autenticado' })
  @ApiOkResponse({ type: MiUsuarioResponseDto })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  async obtenerMiUsuario(@Req() req: RequestConUsuario): Promise<MiUsuarioResponseDto> {
    return this.service.obtenerUsuarioPorId(req.user.id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiParam({ name: 'id', example: 'uuid' })
  @ApiOkResponse({ type: usuarioResponseDto })
  @ApiNotFoundResponse({ description: 'Usuario no encontrado' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  async obtenerUsuarioPorId(
    @Param('id', new ParseUUIDPipe()) id: string
  ): Promise<usuarioResponseDto | null> {
    return this.service.obtenerUsuarioPorId(id);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario propio' })
  @ApiOkResponse({ description: 'Usuario eliminado' })
  @ApiBadRequestResponse({ description: 'Contraseña incorrecta' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  async borrarUsuario(
    @Req() req: RequestConUsuario,
    @Body('contrasenia') contrasenia: string,
  ) {
    return this.service.EliminarUsuario(req.user.id, contrasenia);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('actualizarUsuario')
  @ApiOperation({ summary: 'Actualizar datos del usuario' })
  @ApiBody({ type: actualizarUsuarioDTO })
  @ApiOkResponse({ description: 'Usuario actualizado' })
  @ApiBadRequestResponse({ description: 'Datos inválidos' })
  async actualizarUsuario(
    @Req() req: RequestConUsuario,
    @Body() datos: actualizarUsuarioDTO,
  ) {
    return this.service.ActualizarUsuario(req.user.id, datos);
  }

  @UseGuards(AuthGuard)
  @ApiBearerAuth('access-token')
  @Patch('resetearContrasenia')
  @ApiOperation({ summary: 'Cambiar contraseña' })
  @ApiBody({ type: actualizarContraseniaDTO })
  @ApiOkResponse({ description: 'Contraseña actualizada' })
  @ApiBadRequestResponse({ description: 'Contraseña inválida' })
  @ApiUnauthorizedResponse({ description: 'No autenticado' })
  async resetearContrasenia(
    @Req() req: RequestConUsuario,
    @Body() dto: actualizarContraseniaDTO,
  ) {
    return this.service.ResetearContraseniaUsuario(req.user.id, dto);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Patch(':id/rol')
  @ApiOperation({ summary: 'Cambiar rol de usuario (admin)' })
  @ApiBody({ type: CambiarRolDTO })
  @ApiOkResponse({ description: 'Rol actualizado' })
  @ApiForbiddenResponse({ description: 'No autorizado' })
  async cambiarRolUsuario(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() datos: CambiarRolDTO,
    @Req() req: RequestConUsuario,
  ) {
    return this.service.CambiarRolUsuario(id, req.user.id, datos);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Patch(':id/bloquearUsuario')
  @ApiOperation({ summary: 'Bloquear usuario' })
  @ApiBody({ type: BloquearUsuarioDTO })
  @ApiOkResponse({ description: 'Usuario bloqueado' })
  @ApiForbiddenResponse({ description: 'Sin permisos' })
  async bloquearUsuario(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() datos: BloquearUsuarioDTO,
    @Req() req: RequestConUsuario,
  ) {
    return this.service.BloquearUsuario(id, req.user.id, datos);
  }
}

