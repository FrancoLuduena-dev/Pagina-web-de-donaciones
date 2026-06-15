import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import { CrearDenunciaDto } from '../dtos/crearDenunciaDto';
import { DenunciaResponseDto } from '../dtos/denunciaResponseDto';
import { FiltroDenunciaDto } from '../dtos/filtroDenunciaDto';
import { TomarDenunciaDto } from '../dtos/tomarDenunciaDto';
import { DenunciaService } from '../service/denunciaService';
import { ResolverDenunciaDto } from '../dtos/ResolverDenunciaDto';
import { DenunciaDetalleResponseDto } from '../dtos/denunciaDetalleResponseDto';

const USUARIO_ID_PRUEBA = '550e8400-e29b-41d4-a716-446655440000';
const MODERADOR_ID_PRUEBA = '11111111-1111-4111-8111-111111111111';

@Controller('denuncias')
export class DenunciaController {
  constructor(private readonly denunciaService: DenunciaService) {}

  @Post()
  crearDenuncia(@Body() dto: CrearDenunciaDto): Promise<DenunciaResponseDto> {
    return this.denunciaService.crearDenuncia(USUARIO_ID_PRUEBA, dto);
  }

  @Get()
  listarDenuncias(
    @Query() filtros: FiltroDenunciaDto,
  ): Promise<DenunciaResponseDto[]> {
    return this.denunciaService.listar(filtros);
  }

  @Patch(':id/tomar')
  tomarDenuncia(
    @Param('id') id: string,
    @Body() dto: TomarDenunciaDto,
  ): Promise<DenunciaResponseDto> {
    return this.denunciaService.tomarDenuncia(id, MODERADOR_ID_PRUEBA, dto);
  }

  @Patch(':id/resolver')
  resolverDenuncia(
    @Param('id') id: string,
    @Body() dto: ResolverDenunciaDto,
  ): Promise<DenunciaDetalleResponseDto> {
    return this.denunciaService.resolverDenuncia(id, MODERADOR_ID_PRUEBA, dto);
  }

  @Get(':id')
  buscarDetalle(@Param('id') id: string): Promise<DenunciaDetalleResponseDto> {
    return this.denunciaService.buscarDetallePorId(id);
  }
}
