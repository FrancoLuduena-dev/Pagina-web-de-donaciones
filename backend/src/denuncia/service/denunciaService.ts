import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PublicacionService } from '../../publicacion/service/publicacionService';
import { rolUsuario } from '../../usuario/enums/rolUsuario';

import { CrearDenunciaDto } from '../dtos/crearDenunciaDto';
import { DenunciaDetalleResponseDto } from '../dtos/denunciaDetalleResponseDto';
import { DenunciaResponseDto } from '../dtos/denunciaResponseDto';
import { FiltroDenunciaDto } from '../dtos/filtroDenunciaDto';
import { ResolverDenunciaDto } from '../dtos/ResolverDenunciaDto';
import { TomarDenunciaDto } from '../dtos/tomarDenunciaDto';

import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';

import { DenunciaMapper } from '../mapper/denunciaMapper';
import { DenunciaRepository } from '../repository/denunciaRepository';

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

  async buscarDetallePorId(
    denunciaId: string,
  ): Promise<DenunciaDetalleResponseDto> {
    const denuncia = await this.denunciaRepository.buscarPorId(denunciaId);

    if (!denuncia) {
      throw new NotFoundException('DENUNCIA_NO_ENCONTRADA');
    }

    return DenunciaMapper.toDetalleResponseDto(denuncia);
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

  async resolverDenuncia(
    denunciaId: string,
    moderadorId: string,
    dto: ResolverDenunciaDto,
  ): Promise<DenunciaDetalleResponseDto> {
    const denuncia = await this.denunciaRepository.buscarPorId(denunciaId);

    if (!denuncia) {
      throw new NotFoundException('DENUNCIA_NO_ENCONTRADA');
    }

    if (denuncia.version !== dto.version) {
      throw new ConflictException('CONFLICTO_CONCURRENCIA');
    }

    if (denuncia.estado === EstadoDenuncia.RESUELTA) {
      throw new ConflictException('DENUNCIA_YA_RESUELTA');
    }

    await this.ejecutarAccionResolucion(
      dto.tipoResolucion,
      denuncia.publicacionId,
      moderadorId,
    );

    if (!denuncia.moderadorAsignadoId) {
      denuncia.moderadorAsignadoId = moderadorId;
    }

    try {
      denuncia.resolver(dto.tipoResolucion, dto.detalleResolucion);
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

    return DenunciaMapper.toDetalleResponseDto(denunciaGuardada);
  }

  private async ejecutarAccionResolucion(
    tipoResolucion: TipoResolucion,
    publicacionId: string,
    moderadorId: string,
  ): Promise<void> {
    switch (tipoResolucion) {
      case TipoResolucion.DESCARTADA:
        return;

      case TipoResolucion.PUBLICACION_PAUSADA:
        await this.publicacionService.pausar(
          publicacionId,
          moderadorId,
          rolUsuario.usuarioModerador,
        );
        return;

      case TipoResolucion.PUBLICACION_ELIMINADA:
        await this.publicacionService.eliminar(
          publicacionId,
          moderadorId,
          rolUsuario.usuarioModerador,
        );
        return;

      case TipoResolucion.USUARIO_BLOQUEADO:
        throw new BadRequestException('RESOLUCION_TODAVIA_NO_IMPLEMENTADA');

      default:
        throw new BadRequestException('TIPO_RESOLUCION_INVALIDO');
    }
  }
}
