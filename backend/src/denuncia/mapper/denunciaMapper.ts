import { DenunciaResponseDto } from '../dtos/denunciaResponseDto';
import { DenunciaDetalleResponseDto } from '../dtos/denunciaDetalleResponseDto';
import { Denuncia } from '../entity/denunciaEntity';

export class DenunciaMapper {
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
