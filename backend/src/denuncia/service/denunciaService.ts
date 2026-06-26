import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { PublicacionService } from '../../publicacion/service/publicacionService';
import { rolUsuario } from '../../usuario/enums/rolUsuario';
import UsuarioService from '../../usuario/service/usuarioService';

import { CrearDenunciaDto } from '../dtos/crearDenunciaDto';
import { DenunciaDetalleResponseDto } from '../dtos/denunciaDetalleResponseDto';
import { DenunciaResponseDto } from '../dtos/denunciaResponseDto';
import { FiltroDenunciaDto } from '../dtos/filtroDenunciaDto';
import { TomarDenunciaDto } from '../dtos/tomarDenunciaDto';
import { Denuncia } from '../entity/denunciaEntity';
import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';
import { DenunciaMapper } from '../mapper/denunciaMapper';
import { DenunciaRepository } from '../repository/denunciaRepository';
import { ResolverDenunciaDto } from '../dtos/resolverDenunciaDto';

/**
 * Servicio encargado de orquestar el flujo de denuncias.
 *
 * Implementa las reglas de negocio del módulo: valida que una denuncia sea
 * válida, evita reportes duplicados o injustificados, administra los estados
 * de revisión y aplica las decisiones de moderación sobre publicaciones o
 * usuarios cuando corresponde.
 */
@Injectable()
export class DenunciaService {
  constructor(
    private readonly denunciaRepository: DenunciaRepository,
    private readonly publicacionService: PublicacionService,
    private readonly usuarioService: UsuarioService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Crea una denuncia para una publicación existente.
   *
   * Aplica las reglas de negocio principales del módulo: no se permite
   * denunciar una publicación propia, tampoco se admiten denuncias
   * duplicadas del mismo usuario sobre la misma publicación y el nuevo
   * registro queda en estado pendiente para su revisión.
   *
   * @param denuncianteId Identificador del usuario que realiza la denuncia.
   * @param dto Datos necesarios para crear la denuncia.
   * @returns Denuncia creada en formato de respuesta.
   *
   * @throws ConflictException Cuando el usuario ya denunció la misma publicación.
   */
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

  /**
   * Lista denuncias según los filtros recibidos.
   *
   * Esta operación sirve al flujo de moderación para consultar reportes
   * agrupados por estado o por la publicación denunciada, facilitando la
   * revisión y priorización de casos.
   *
   * @param filtros Criterios de búsqueda para obtener las denuncias.
   * @returns Lista de denuncias en formato de respuesta.
   */
  async listar(filtros: FiltroDenunciaDto): Promise<DenunciaResponseDto[]> {
    const denuncias = await this.denunciaRepository.listar(filtros);

    return denuncias.map((denuncia) => DenunciaMapper.toResponseDto(denuncia));
  }

  /**
   * Obtiene el detalle completo de una denuncia específica.
   *
   * Permite ampliar la información del reporte para que los moderadores
   * puedan evaluar el contexto completo antes de tomar una decisión.
   *
   * @param denunciaId Identificador de la denuncia a consultar.
   * @returns Detalle completo de la denuncia.
   */
  async buscarDetallePorId(
    denunciaId: string,
  ): Promise<DenunciaDetalleResponseDto> {
    const denuncia = await this.obtenerDenunciaPorId(denunciaId);

    return DenunciaMapper.toDetalleResponseDto(denuncia);
  }

  /**
   * Asigna una denuncia a un moderador para su revisión.
   *
   * El sistema cambia el estado de la denuncia a revisión y la vincula al
   * moderador responsable de analizarla, reforzando el flujo de atención
   * de los reportes.
   *
   * @param denunciaId Identificador de la denuncia a tomar.
   * @param moderadorId Identificador del moderador que toma la denuncia.
   * @param dto Datos necesarios para tomar la denuncia.
   * @returns Denuncia actualizada en formato de respuesta.
   */
  async tomarDenuncia(
    denunciaId: string,
    moderadorId: string,
    dto: TomarDenunciaDto,
  ): Promise<DenunciaResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const denuncia = await this.obtenerDenunciaPorIdConBloqueo(
        manager,
        denunciaId,
      );

      this.validarVersionDenuncia(denuncia, dto.version);

      denuncia.tomar(moderadorId);

      const denunciaGuardada = await manager.save(denuncia);

      return DenunciaMapper.toResponseDto(denunciaGuardada);
    });
  }
  /**
   * Resuelve una denuncia ya revisada por un moderador.
   *
   * Dependiendo del tipo de resolución elegido, el sistema puede descartar
   * el reporte o aplicar una medida de moderación sobre la publicación o
   * sobre el usuario creador de la misma.
   *
   * @param denunciaId Identificador de la denuncia a resolver.
   * @param moderadorId Identificador del moderador que resuelve la denuncia.
   * @param dto Datos necesarios para resolver la denuncia.
   * @returns Detalle actualizado de la denuncia resuelta.
   */
  async resolverDenuncia(
    denunciaId: string,
    moderadorId: string,
    dto: ResolverDenunciaDto,
  ): Promise<DenunciaDetalleResponseDto> {
    return this.dataSource.transaction(async (manager) => {
      const denuncia = await this.obtenerDenunciaPorIdConBloqueo(
        manager,
        denunciaId,
      );

      this.validarVersionDenuncia(denuncia, dto.version);
      this.validarDenunciaNoResuelta(denuncia);
      denuncia.validarPuedeResolver(moderadorId);

      await this.ejecutarAccionResolucion(
        dto.tipoResolucion,
        denuncia.publicacionId,
        denuncia.creadorPublicacionId,
        moderadorId,
        dto.detalleResolucion,
      );

      denuncia.resolver(moderadorId, dto.tipoResolucion, dto.detalleResolucion);

      const denunciaGuardada = await manager.save(denuncia);

      return DenunciaMapper.toDetalleResponseDto(denunciaGuardada);
    });
  }

  /**
   * Busca una denuncia por su identificador.
   *
   * Se utiliza cuando el servicio necesita obtener una denuncia existente
   * antes de devolver su detalle o continuar con una operación.
   *
   * @param denunciaId Identificador de la denuncia.
   * @returns Denuncia encontrada.
   *
   * @throws NotFoundException Cuando no existe una denuncia con ese identificador.
   */
  private async obtenerDenunciaPorId(denunciaId: string): Promise<Denuncia> {
    const denuncia = await this.denunciaRepository.buscarPorId(denunciaId);

    if (!denuncia) {
      throw new NotFoundException('DENUNCIA_NO_ENCONTRADA');
    }

    return denuncia;
  }

  /**
   * Busca una denuncia por su identificador aplicando bloqueo de escritura.
   *
   * Se utiliza en operaciones transaccionales para evitar que dos procesos
   * modifiquen simultáneamente la misma denuncia.
   *
   * @param manager Gestor de la transacción activa.
   * @param denunciaId Identificador de la denuncia a recuperar.
   * @returns Denuncia encontrada con bloqueo de escritura.
   *
   * @throws NotFoundException Cuando no existe una denuncia con ese identificador.
   */
  private async obtenerDenunciaPorIdConBloqueo(
    manager: EntityManager,
    denunciaId: string,
  ): Promise<Denuncia> {
    const denuncia = await manager.findOne(Denuncia, {
      where: { id: denunciaId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!denuncia) {
      throw new NotFoundException('DENUNCIA_NO_ENCONTRADA');
    }

    return denuncia;
  }

  /**
   * Valida que la versión recibida coincida con la versión actual de la denuncia.
   *
   * Se utiliza antes de modificar una denuncia para evitar aplicar cambios
   * sobre información desactualizada por concurrencia.
   *
   * @param denuncia Denuncia que se desea modificar.
   * @param version Versión recibida desde el cliente.
   *
   * @throws ConflictException Cuando la versión recibida no coincide con la actual.
   */
  private validarVersionDenuncia(denuncia: Denuncia, version: number): void {
    if (denuncia.version !== version) {
      throw new ConflictException('CONFLICTO_CONCURRENCIA');
    }
  }

  /**
   * Valida que la denuncia aún no haya sido resuelta.
   *
   * @param denuncia Denuncia que se quiere resolver.
   *
   * @throws ConflictException Cuando la denuncia ya fue resuelta.
   */
  private validarDenunciaNoResuelta(denuncia: Denuncia): void {
    if (denuncia.estado === EstadoDenuncia.RESUELTA) {
      throw new ConflictException('DENUNCIA_YA_RESUELTA');
    }
  }

  /**
   * Ejecuta la acción correspondiente al tipo de resolución seleccionado.
   *
   * Si la denuncia se descarta, no realiza cambios adicionales. En los demás
   * casos puede pausar la publicación, eliminarla o bloquear al usuario creador
   * de la publicación denunciada.
   *
   * @param tipoResolucion Resolución elegida para la denuncia.
   * @param publicacionId Identificador de la publicación denunciada.
   * @param creadorPublicacionId Identificador del usuario creador de la publicación.
   * @param moderadorId Identificador del moderador que resuelve la denuncia.
   * @param detalleResolucion Detalle ingresado al resolver la denuncia.
   *
   * @throws BadRequestException Cuando el tipo de resolución no es válido.
   */

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
