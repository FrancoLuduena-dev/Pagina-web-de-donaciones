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

import { AuthGuard } from '../auth/authGuard';
import { Roles } from '../auth/authRolesDecorator';
import { RolesGuard } from '../auth/authGuardRoles';

import { rolUsuario } from '../enums/rolUsuario';

interface RequestConUsuario extends Request {
  user: Usuario;
}

@Controller('usuario')
export default class UsuarioController {
  constructor(
    private readonly service: UsuarioService,
    private readonly authService: autenticacionUsuario,
  ) {}

  @Post()
  async crearUsuario(@Body() usuario: CrearUsuarioDTO): Promise<Usuario> {
    return this.authService.registrarUsuario(usuario);
  }

  @Post('login')
  async login(@Body() datos: logearUsuarioDTO) {
    const token = await this.authService.logearUsuario(datos);

    return {
      accessToken: token,
    };
  }

  @UseGuards(AuthGuard)
  @Get()
  async listarUsuarios(): Promise<Usuario[]> {
    return this.service.ListarUsuarios();
  }

  @UseGuards(AuthGuard)
  @Get('nombre/:nombreUsuario')
  async obtenerUsuarioPorNombreUsuario(
    @Param('nombreUsuario') nombreUsuario: string,
  ): Promise<Usuario | null> {
    return this.service.ObtenerUsuarioPorNombreUsuario(nombreUsuario);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  async obtenerUsuarioPorId(@Param('id') id: string): Promise<Usuario | null> {
    return this.service.obtenerUsuarioPorId(id);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  async borrarUsuario(
    @Param('id') id: string,
    @Body('contrasenia') contrasenia: string,
  ) {
    return this.service.EliminarUsuario(id, contrasenia);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(rolUsuario.usuarioAdministrador)
  @Delete('admin/:id')
  async borrarUsuarioAdmin(
    @Param('id') id: string,
    @Req() req: RequestConUsuario,
  ) {
    return this.service.EliminarUsuarioAdmin(id, req.user.id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  async actualizarUsuario(
    @Param('id') id: string,
    @Body() datos: actualizarUsuarioDTO,
  ) {
    return this.service.ActualizarUsuario(id, datos);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(rolUsuario.usuarioAdministrador)
  @Patch(':id/rol')
  async cambiarRolUsuario(
    @Param('id') id: string,
    @Body() datos: CambiarRolDTO,
    @Req() req: RequestConUsuario,
  ) {
    return this.service.CambiarRolUsuario(id, req.user.id, datos);
  }

  @UseGuards(AuthGuard)
  @Patch(':id/resetearContrasenia')
  async resetearContrasenia(
    @Param('id') id: string,
    @Body('contraseniaActual') contraseniaActual: string,
    @Body('contraseniaNueva') contraseniaNueva: string,
  ) {
    return this.service.ResetearContraseniaUsuario(
      id,
      contraseniaActual,
      contraseniaNueva,
    );
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(rolUsuario.usuarioModerador, rolUsuario.usuarioAdministrador)
  @Patch(':id/bloquearUsuario')
  async bloquearUsuario(
    @Param('id') id: string,
    @Body() datos: BloquearUsuarioDTO,
    @Req() req: RequestConUsuario,
  ) {
    return this.service.BloquearUsuario(id, req.user.id, datos);
  }
}
