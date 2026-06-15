import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { DenunciaMapper } from '../mapper/denunciaMapper';
import { DenunciaRepository } from '../repository/denunciaRepository';
import { PublicacionService } from '../../publicacion/service/publicacionService';
import { CrearDenunciaDto } from '../dtos/crearDenunciaDto';
import { DenunciaResponseDto } from '../dtos/denunciaResponseDto';
import { FiltroDenunciaDto } from '../dtos/filtroDenunciaDto';
import { TomarDenunciaDto } from '../dtos/tomarDenunciaDto';

@Injectable()
export class DenunciaService {
  constructor(
    private readonly denunciaRepository: DenunciaRepository,
    private readonly publicacionService: PublicacionService,
  ) {}

  async crearDenuncia(
    denuncianteId: string,
    dto: CrearDenunciaDto,
  ): Promise<DenunciaResponseDto> {
    const publicacion = await this.publicacionService.buscarPublicacionPorId(
      dto.publicacionId,
    );

    if (publicacion.creadorId === denuncianteId) {
      throw new ForbiddenException('NO_PUEDE_DENUNCIAR_PROPIA_PUBLICACION');
    }

    const denunciaExistente =
      await this.denunciaRepository.buscarPorDenuncianteYPublicacion(
        denuncianteId,
        dto.publicacionId,
      );

    if (denunciaExistente) {
      throw new ConflictException('DENUNCIA_DUPLICADA');
    }

    const denuncia = this.denunciaRepository.crear({
      publicacionId: dto.publicacionId,
      denuncianteId,
      creadorPublicacionId: publicacion.creadorId,
      motivo: dto.motivo,
      comentario: dto.comentario ?? null,
      estado: EstadoDenuncia.PENDIENTE,
      version: 1,
    });

    const denunciaGuardada = await this.denunciaRepository.guardar(denuncia);

    return DenunciaMapper.toResponseDto(denunciaGuardada);
  }

  async listar(filtros: FiltroDenunciaDto): Promise<DenunciaResponseDto[]> {
    const denuncias = await this.denunciaRepository.listar(filtros);

    return denuncias.map((denuncia) => DenunciaMapper.toResponseDto(denuncia));
  }

  async tomarDenuncia(
    denunciaId: string,
    moderadorId: string,
    dto: TomarDenunciaDto,
  ): Promise<DenunciaResponseDto> {
    const denuncia = await this.denunciaRepository.buscarPorId(denunciaId);

    if (!denuncia) {
      throw new NotFoundException('DENUNCIA_NO_ENCONTRADA');
    }

    if (denuncia.version !== dto.version) {
      throw new ConflictException('CONFLICTO_CONCURRENCIA');
    }

    try {
      denuncia.tomar(moderadorId);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'TRANSICION_ESTADO_INVALIDA'
      ) {
        throw new ConflictException('TRANSICION_ESTADO_INVALIDA');
      }

      throw error;
    }

    const denunciaGuardada = await this.denunciaRepository.guardar(denuncia);

    return DenunciaMapper.toResponseDto(denunciaGuardada);
  }
}
