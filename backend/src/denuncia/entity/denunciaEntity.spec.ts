import { BadRequestException, ForbiddenException } from '@nestjs/common';

import { Denuncia } from './denunciaEntity';
import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';

describe('Denuncia', () => {
  const moderadorAsignadoId = '22222222-2222-4222-8222-222222222222';

  it('solo permite pasar de pendiente a en revisión al tomarla', () => {
    const denuncia = crearDenuncia();

    denuncia.tomar(moderadorAsignadoId);

    expect(denuncia.estado).toBe(EstadoDenuncia.EN_REVISION);
    expect(denuncia.moderadorAsignadoId).toBe(moderadorAsignadoId);
    expect(denuncia.version).toBe(2);
  });

  it('no permite resolver una denuncia pendiente', () => {
    const denuncia = crearDenuncia();

    expect(() =>
      denuncia.resolver(
        moderadorAsignadoId,
        TipoResolucion.DESCARTADA,
        'La denuncia no corresponde y se descarta luego de revisarla.',
      ),
    ).toThrow(BadRequestException);

    expect(denuncia.estado).toBe(EstadoDenuncia.PENDIENTE);
    expect(denuncia.version).toBe(1);
  });

  it('no permite resolver a un moderador distinto del asignado', () => {
    const denuncia = crearDenuncia();
    denuncia.tomar(moderadorAsignadoId);

    expect(() =>
      denuncia.resolver(
        '33333333-3333-4333-8333-333333333333',
        TipoResolucion.DESCARTADA,
        'La denuncia no corresponde y se descarta luego de revisarla.',
      ),
    ).toThrow(ForbiddenException);

    expect(denuncia.estado).toBe(EstadoDenuncia.EN_REVISION);
    expect(denuncia.version).toBe(2);
  });

  it('permite resolver al moderador asignado', () => {
    const denuncia = crearDenuncia();
    denuncia.tomar(moderadorAsignadoId);

    denuncia.resolver(
      moderadorAsignadoId,
      TipoResolucion.DESCARTADA,
      'La denuncia no corresponde y se descarta luego de revisarla.',
    );

    expect(denuncia.estado).toBe(EstadoDenuncia.RESUELTA);
    expect(denuncia.tipoResolucion).toBe(TipoResolucion.DESCARTADA);
    expect(denuncia.version).toBe(3);
    expect(denuncia.fechaResolucion).toBeInstanceOf(Date);
  });

  function crearDenuncia(): Denuncia {
    return Object.assign(new Denuncia(), {
      estado: EstadoDenuncia.PENDIENTE,
      moderadorAsignadoId: null,
      tipoResolucion: null,
      detalleResolucion: null,
      fechaResolucion: null,
      version: 1,
    });
  }
});
