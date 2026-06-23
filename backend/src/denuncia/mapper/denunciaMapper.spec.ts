import { Denuncia } from '../entity/denunciaEntity';
import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { MotivoDenuncia } from '../enums/motivoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';
import { DenunciaMapper } from './denunciaMapper';

describe('DenunciaMapper', () => {
  it('incluye el contexto necesario en el listado', () => {
    const denuncia = crearDenuncia();

    expect(DenunciaMapper.toResponseDto(denuncia)).toEqual({
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
    });
  });

  it('incluye los datos completos de resolución en el detalle', () => {
    const denuncia = crearDenuncia();

    expect(DenunciaMapper.toDetalleResponseDto(denuncia)).toEqual(
      expect.objectContaining({
        denuncianteId: denuncia.denuncianteId,
        creadorPublicacionId: denuncia.creadorPublicacionId,
        moderadorAsignadoId: denuncia.moderadorAsignadoId,
        detalleResolucion: denuncia.detalleResolucion,
        fechaResolucion: denuncia.fechaResolucion,
        fechaActualizacion: denuncia.fechaActualizacion,
      }),
    );
  });

  function crearDenuncia(): Denuncia {
    return Object.assign(new Denuncia(), {
      id: '11111111-1111-4111-8111-111111111111',
      publicacionId: '22222222-2222-4222-8222-222222222222',
      denuncianteId: '33333333-3333-4333-8333-333333333333',
      creadorPublicacionId: '44444444-4444-4444-8444-444444444444',
      moderadorAsignadoId: '55555555-5555-4555-8555-555555555555',
      motivo: MotivoDenuncia.CONTENIDO_INAPROPIADO,
      comentario: 'La publicación contiene información inapropiada.',
      estado: EstadoDenuncia.RESUELTA,
      tipoResolucion: TipoResolucion.PUBLICACION_PAUSADA,
      detalleResolucion: 'Se pausó la publicación mientras se revisa el caso.',
      fechaResolucion: new Date('2026-06-22T12:00:00.000Z'),
      fechaCreacion: new Date('2026-06-21T12:00:00.000Z'),
      fechaActualizacion: new Date('2026-06-22T12:00:00.000Z'),
      version: 3,
    });
  }
});
