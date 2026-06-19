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

import { Request } from 'express';
import { AuthGuard } from '../../usuario/auth/authGuard';
import { rolUsuario } from '../../usuario/enums/rolUsuario';
import { Roles } from '../../compartidos/decorators/decoratorRol';
import { RolesGuard } from '../../compartidos/guards/rolesGuard';
import { StatusGuard } from '../../compartidos/guards/statusGuard';
import { CrearDenunciaDto } from '../dtos/crearDenunciaDto';
import { DenunciaDetalleResponseDto } from '../dtos/denunciaDetalleResponseDto';
import { DenunciaResponseDto } from '../dtos/denunciaResponseDto';
import { FiltroDenunciaDto } from '../dtos/filtroDenunciaDto';
import { ResolverDenunciaDto } from '../dtos/resolverDenunciaDto';
import { TomarDenunciaDto } from '../dtos/tomarDenunciaDto';
import { DenunciaService } from '../service/denunciaService';
import type { RequestConUsuario } from 'src/compartidos/tipo/requestConUsuario';

@Controller('denuncias')
@UseGuards(AuthGuard, StatusGuard, RolesGuard)
export class DenunciaController {
  constructor(private readonly denunciaService: DenunciaService) {}

  @Post()
  crearDenuncia(
    @Req() req: RequestConUsuario,
    @Body() dto: CrearDenunciaDto,
  ): Promise<DenunciaResponseDto> {
    return this.denunciaService.crearDenuncia(req.user.id, dto);
  }

  @Get()
  @Roles(rolUsuario.usuarioModerador, rolUsuario.usuarioAdministrador)
  listarDenuncias(
    @Query() filtros: FiltroDenunciaDto,
  ): Promise<DenunciaResponseDto[]> {
    return this.denunciaService.listar(filtros);
  }

  @Get(':id')
  @Roles(rolUsuario.usuarioModerador, rolUsuario.usuarioAdministrador)
  buscarDetalle(@Param('id') id: string): Promise<DenunciaDetalleResponseDto> {
    return this.denunciaService.buscarDetallePorId(id);
  }

  @Patch(':id/tomar')
  @Roles(rolUsuario.usuarioModerador, rolUsuario.usuarioAdministrador)
  tomarDenuncia(
    @Req() req: RequestConUsuario,
    @Param('id') id: string,
    @Body() dto: TomarDenunciaDto,
  ): Promise<DenunciaResponseDto> {
    return this.denunciaService.tomarDenuncia(id, req.user.id, dto);
  }

  @Patch(':id/resolver')
  @Roles(rolUsuario.usuarioModerador, rolUsuario.usuarioAdministrador)
  resolverDenuncia(
    @Req() req: RequestConUsuario,
    @Param('id') id: string,
    @Body() dto: ResolverDenunciaDto,
  ): Promise<DenunciaDetalleResponseDto> {
    return this.denunciaService.resolverDenuncia(id, req.user.id, dto);
  }
}
