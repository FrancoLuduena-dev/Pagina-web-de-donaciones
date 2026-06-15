// src/denuncia/controller/denunciaController.ts

import { Body, Controller, Post } from '@nestjs/common';
import { DenunciaService } from '../service/denunciaService';
import { CrearDenunciaDto } from '../dtos/crearDenunciaDto';
import { DenunciaResponseDto } from '../dtos/denunciaResponseDto';

const USUARIO_ID_PRUEBA = '550e8400-e29b-41d4-a716-446655440011';

@Controller('denuncias')
export class DenunciaController {
  constructor(private readonly denunciaService: DenunciaService) {}

  @Post()
  crearDenuncia(@Body() dto: CrearDenunciaDto): Promise<DenunciaResponseDto> {
    return this.denunciaService.crearDenuncia(USUARIO_ID_PRUEBA, dto);
  }
}
