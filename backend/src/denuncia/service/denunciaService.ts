import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { DenunciaMapper } from '../mapper/denunciaMapper';
import { DenunciaRepository } from '../repository/denunciaRepository';
import { PublicacionService } from '../../publicacion/service/publicacionService';
import { CrearDenunciaDto } from '../dtos/crearDenunciaDto';
import { DenunciaResponseDto } from '../dtos/denunciaResponseDto';

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
}
