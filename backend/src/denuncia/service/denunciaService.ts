import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PublicacionService } from '../../publicacion/service/publicacionService';
import { rolUsuario } from '../../usuario/enums/rolUsuario';
import UsuarioService from '../../usuario/service/usuarioService';

import { CrearDenunciaDto } from '../dtos/crearDenunciaDto';
import { DenunciaDetalleResponseDto } from '../dtos/denunciaDetalleResponseDto';
import { DenunciaResponseDto } from '../dtos/denunciaResponseDto';
import { FiltroDenunciaDto } from '../dtos/filtroDenunciaDto';
import { ResolverDenunciaDto } from '../dtos/resolverDenunciaDto';
import { TomarDenunciaDto } from '../dtos/tomarDenunciaDto';

import { Denuncia } from '../entity/denunciaEntity';
import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';

import { DenunciaMapper } from '../mapper/denunciaMapper';
import { DenunciaRepository } from '../repository/denunciaRepository';

@Injectable()
export class DenunciaService {
  constructor(
    private readonly denunciaRepository: DenunciaRepository,
    private readonly publicacionService: PublicacionService,
    private readonly usuarioService: UsuarioService,
  ) {}

  async crearDenuncia(
    denuncianteId: string,
    dto: CrearDenunciaDto,
  ): Promise<DenunciaResponseDto> {
    const publicacion = await this.publicacionService.buscarPublicacionPorId(
      dto.publicacionId,
    );

    publicacion.validarNoEsCreador(
      denuncianteId,
      'NO_PUEDE_DENUNCIAR_PROPIA_PUBLICACION',
    );

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
    const denuncia = await this.obtenerDenunciaPorId(denunciaId);

    return DenunciaMapper.toDetalleResponseDto(denuncia);
  }

  async tomarDenuncia(
    denunciaId: string,
    moderadorId: string,
    dto: TomarDenunciaDto,
  ): Promise<DenunciaResponseDto> {
    const denuncia = await this.obtenerDenunciaPorId(denunciaId);

    this.validarVersionDenuncia(denuncia, dto.version);

    denuncia.tomar(moderadorId);

    const denunciaGuardada = await this.denunciaRepository.guardar(denuncia);

    return DenunciaMapper.toResponseDto(denunciaGuardada);
  }

  async resolverDenuncia(
    denunciaId: string,
    moderadorId: string,
    dto: ResolverDenunciaDto,
  ): Promise<DenunciaDetalleResponseDto> {
    const denuncia = await this.obtenerDenunciaPorId(denunciaId);

    this.validarVersionDenuncia(denuncia, dto.version);
    this.validarDenunciaNoResuelta(denuncia);

    await this.ejecutarAccionResolucion(
      dto.tipoResolucion,
      denuncia.publicacionId,
      denuncia.creadorPublicacionId,
      moderadorId,
      dto.detalleResolucion,
    );

    if (!denuncia.moderadorAsignadoId) {
      denuncia.tomar(moderadorId);
    }

    denuncia.resolver(dto.tipoResolucion, dto.detalleResolucion);

    const denunciaGuardada = await this.denunciaRepository.guardar(denuncia);

    return DenunciaMapper.toDetalleResponseDto(denunciaGuardada);
  }

  private async obtenerDenunciaPorId(denunciaId: string): Promise<Denuncia> {
    const denuncia = await this.denunciaRepository.buscarPorId(denunciaId);

    if (!denuncia) {
      throw new NotFoundException('DENUNCIA_NO_ENCONTRADA');
    }

    return denuncia;
  }

  private validarVersionDenuncia(denuncia: Denuncia, version: number): void {
    if (denuncia.version !== version) {
      throw new ConflictException('CONFLICTO_CONCURRENCIA');
    }
  }

  private validarDenunciaNoResuelta(denuncia: Denuncia): void {
    if (denuncia.estado === EstadoDenuncia.RESUELTA) {
      throw new ConflictException('DENUNCIA_YA_RESUELTA');
    }
  }

  private async ejecutarAccionResolucion(
    tipoResolucion: TipoResolucion,
    publicacionId: string,
    creadorPublicacionId: string,
    moderadorId: string,
    detalleResolucion: string,
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
        await this.usuarioService.BloquearUsuario(
          creadorPublicacionId,
          moderadorId,
          {
            razonBloqueo: detalleResolucion,
          },
        );
        return;

      default:
        throw new BadRequestException('TIPO_RESOLUCION_INVALIDO');
    }
  }
}
