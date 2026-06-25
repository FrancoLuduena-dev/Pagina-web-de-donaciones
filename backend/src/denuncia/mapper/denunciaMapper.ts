import { DenunciaResponseDto } from '../dtos/denunciaResponseDto';
import { DenunciaDetalleResponseDto } from '../dtos/denunciaDetalleResponseDto';
import { Denuncia } from '../entity/denunciaEntity';

/**
 * Mapper responsable de convertir entidades de denuncia en DTOs de salida.
 *
 * Separa la representación interna de la entidad del formato expuesto por la API.
 */
export class DenunciaMapper {
  /**
   * Convierte una entidad Denuncia en un DTO de respuesta resumido.
   *
   * Este formato se utiliza en operaciones de creación, listado o
   * actualización básica de una denuncia.
   *
   * @param denuncia Entidad de denuncia a transformar.
   * @returns DTO de respuesta con los datos principales de la denuncia.
   */
  static toResponseDto(denuncia: Denuncia): DenunciaResponseDto {
    return {
      id: denuncia.id,
      publicacionId: denuncia.publicacionId,
      denuncianteId: denuncia.denuncianteId,
      creadorPublicacionId: denuncia.creadorPublicacionId,
      moderadorAsignadoId: denuncia.moderadorAsignadoId,
      motivo: denuncia.motivo,
      comentario: denuncia.comentario,
      estado: denuncia.estado,
      tipoResolucion: denuncia.tipoResolucion,
      fechaCreacion: denuncia.fechaCreacion,
      fechaActualizacion: denuncia.fechaActualizacion,
      version: denuncia.version,
    };
  }
  /**
   * Convierte una entidad Denuncia en un DTO de detalle.
   *
   * Este formato incluye información adicional de la resolución, como el
   * detalle informado por el moderador y la fecha en la que fue resuelta.
   *
   * @param denuncia Entidad de denuncia a transformar.
   * @returns DTO con el detalle completo de la denuncia.
   */
  static toDetalleResponseDto(denuncia: Denuncia): DenunciaDetalleResponseDto {
    return {
      id: denuncia.id,
      publicacionId: denuncia.publicacionId,
      denuncianteId: denuncia.denuncianteId,
      creadorPublicacionId: denuncia.creadorPublicacionId,
      moderadorAsignadoId: denuncia.moderadorAsignadoId,
      motivo: denuncia.motivo,
      comentario: denuncia.comentario,
      estado: denuncia.estado,
      tipoResolucion: denuncia.tipoResolucion,
      detalleResolucion: denuncia.detalleResolucion,
      fechaResolucion: denuncia.fechaResolucion,
      fechaCreacion: denuncia.fechaCreacion,
      fechaActualizacion: denuncia.fechaActualizacion,
      version: denuncia.version,
    };
  }
}
