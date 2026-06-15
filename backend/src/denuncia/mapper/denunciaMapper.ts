import { DenunciaResponseDto } from '../dtos/denunciaResponseDto';
import { Denuncia } from '../entity/denunciaEntity';

export class DenunciaMapper {
  static toResponseDto(denuncia: Denuncia): DenunciaResponseDto {
    return {
      id: denuncia.id,
      publicacionId: denuncia.publicacionId,
      motivo: denuncia.motivo,
      estado: denuncia.estado,
      fechaCreacion: denuncia.fechaCreacion,
      version: denuncia.version,
    };
  }
}
