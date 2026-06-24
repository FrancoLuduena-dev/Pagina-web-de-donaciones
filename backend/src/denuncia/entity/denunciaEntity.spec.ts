import { BadRequestException, ForbiddenException } from '@nestjs/common';

import {
  TRANSICIONES_DENUNCIA,
  puedeTransicionarDenuncia,
} from '../constante/transicionesDenuncia';
import { Denuncia } from './denunciaEntity';
import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { MotivoDenuncia } from '../enums/motivoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';

describe('DenunciaEntity', () => {
  const denuncianteId = '11111111-1111-4111-8111-111111111111';
  const creadorPublicacionId = '22222222-2222-4222-8222-222222222222';
  const moderadorAsignadoId = '33333333-3333-4333-8333-333333333333';
  const otroModeradorId = '44444444-4444-4444-8444-444444444444';
  const fechaResolucion = new Date('2026-06-24T10:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fechaResolucion);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('transiciones', () => {
    it('declara correctamente las transiciones permitidas', () => {
      expect(TRANSICIONES_DENUNCIA).toEqual({
        [EstadoDenuncia.PENDIENTE]: [EstadoDenuncia.EN_REVISION],
        [EstadoDenuncia.EN_REVISION]: [EstadoDenuncia.RESUELTA],
        [EstadoDenuncia.RESUELTA]: [],
      });
    });

    it.each([
      [EstadoDenuncia.PENDIENTE, EstadoDenuncia.PENDIENTE, false],
      [EstadoDenuncia.PENDIENTE, EstadoDenuncia.EN_REVISION, true],
      [EstadoDenuncia.PENDIENTE, EstadoDenuncia.RESUELTA, false],
      [EstadoDenuncia.EN_REVISION, EstadoDenuncia.PENDIENTE, false],
      [EstadoDenuncia.EN_REVISION, EstadoDenuncia.EN_REVISION, false],
      [EstadoDenuncia.EN_REVISION, EstadoDenuncia.RESUELTA, true],
      [EstadoDenuncia.RESUELTA, EstadoDenuncia.PENDIENTE, false],
      [EstadoDenuncia.RESUELTA, EstadoDenuncia.EN_REVISION, false],
      [EstadoDenuncia.RESUELTA, EstadoDenuncia.RESUELTA, false],
    ])(
      'valida transición %s -> %s como %s',
      (estadoActual, nuevoEstado, esperado) => {
        expect(puedeTransicionarDenuncia(estadoActual, nuevoEstado)).toBe(
          esperado,
        );
      },
    );
  });

  describe('validaciones', () => {
    it('rechaza que el creador denuncie su propia publicación', () => {
      const denuncia = crearDenuncia();

      const error = capturarError(() =>
        denuncia.validarNoEsCreadorPublicacion(creadorPublicacionId),
      );

      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toBe('No podés denunciar tu propia publicación');
    });

    it('permite denunciar si el usuario no es el creador', () => {
      const denuncia = crearDenuncia();

      expect(() =>
        denuncia.validarNoEsCreadorPublicacion(denuncianteId),
      ).not.toThrow();
    });

    it('usa el mensaje personalizado al validar creador', () => {
      const denuncia = crearDenuncia();

      const error = capturarError(() =>
        denuncia.validarNoEsCreadorPublicacion(
          creadorPublicacionId,
          'NO_PUEDE_DENUNCIAR_PROPIA_PUBLICACION',
        ),
      );

      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toBe('NO_PUEDE_DENUNCIAR_PROPIA_PUBLICACION');
    });

    it('permite actuar al moderador asignado', () => {
      const denuncia = crearDenunciaEnRevision();

      expect(() =>
        denuncia.validarModeradorAsignado(moderadorAsignadoId),
      ).not.toThrow();
    });

    it('rechaza actuar a un moderador distinto del asignado', () => {
      const denuncia = crearDenunciaEnRevision();

      const error = capturarError(() =>
        denuncia.validarModeradorAsignado(otroModeradorId),
      );

      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toBe(
        'Solo el moderador asignado puede realizar esta acción',
      );
    });

    it('rechaza actuar si la denuncia no tiene moderador asignado', () => {
      const denuncia = crearDenuncia();

      const error = capturarError(() =>
        denuncia.validarModeradorAsignado(moderadorAsignadoId),
      );

      expect(error).toBeInstanceOf(ForbiddenException);
    });

    it('validarPuedeResolver exige EN_REVISION', () => {
      const denuncia = crearDenuncia();

      const error = capturarError(() =>
        denuncia.validarPuedeResolver(moderadorAsignadoId),
      );

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('DENUNCIA_DEBE_ESTAR_EN_REVISION');
    });

    it('validarPuedeResolver exige que resuelva el moderador asignado', () => {
      const denuncia = crearDenunciaEnRevision();

      const error = capturarError(() =>
        denuncia.validarPuedeResolver(otroModeradorId),
      );

      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toBe('SOLO_MODERADOR_ASIGNADO_PUEDE_RESOLVER');
    });

    it('validarPuedeResolver permite resolver al moderador asignado', () => {
      const denuncia = crearDenunciaEnRevision();

      expect(() =>
        denuncia.validarPuedeResolver(moderadorAsignadoId),
      ).not.toThrow();
    });
  });

  describe('tomar', () => {
    it('toma una denuncia pendiente', () => {
      const denuncia = crearDenuncia();

      denuncia.tomar(moderadorAsignadoId);

      expect(denuncia.estado).toBe(EstadoDenuncia.EN_REVISION);
      expect(denuncia.moderadorAsignadoId).toBe(moderadorAsignadoId);
      expect(denuncia.version).toBe(2);
    });

    it('no permite tomar una denuncia en revisión', () => {
      const denuncia = crearDenunciaEnRevision();

      const error = capturarError(() => denuncia.tomar(otroModeradorId));

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        'No se puede cambiar una denuncia de EN_REVISION a EN_REVISION',
      );
      expect(denuncia.estado).toBe(EstadoDenuncia.EN_REVISION);
      expect(denuncia.moderadorAsignadoId).toBe(moderadorAsignadoId);
      expect(denuncia.version).toBe(2);
    });

    it('no permite tomar una denuncia resuelta', () => {
      const denuncia = crearDenunciaResuelta();

      const error = capturarError(() => denuncia.tomar(otroModeradorId));

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe(
        'No se puede cambiar una denuncia de RESUELTA a EN_REVISION',
      );
      expect(denuncia.estado).toBe(EstadoDenuncia.RESUELTA);
      expect(denuncia.moderadorAsignadoId).toBe(moderadorAsignadoId);
      expect(denuncia.version).toBe(3);
    });
  });

  describe('resolver', () => {
    it('resuelve una denuncia en revisión', () => {
      const denuncia = crearDenunciaEnRevision();

      denuncia.resolver(
        moderadorAsignadoId,
        TipoResolucion.PUBLICACION_ELIMINADA,
        'Se elimina la publicación denunciada por incumplir las reglas.',
      );

      expect(denuncia.estado).toBe(EstadoDenuncia.RESUELTA);
      expect(denuncia.tipoResolucion).toBe(
        TipoResolucion.PUBLICACION_ELIMINADA,
      );
      expect(denuncia.detalleResolucion).toBe(
        'Se elimina la publicación denunciada por incumplir las reglas.',
      );
      expect(denuncia.fechaResolucion).toEqual(fechaResolucion);
      expect(denuncia.version).toBe(3);
    });

    it.each([
      TipoResolucion.DESCARTADA,
      TipoResolucion.PUBLICACION_PAUSADA,
      TipoResolucion.PUBLICACION_ELIMINADA,
      TipoResolucion.USUARIO_BLOQUEADO,
    ])('permite resolver con tipo %s', (tipoResolucion) => {
      const denuncia = crearDenunciaEnRevision();

      denuncia.resolver(
        moderadorAsignadoId,
        tipoResolucion,
        'Detalle válido para resolver la denuncia correctamente.',
      );

      expect(denuncia.estado).toBe(EstadoDenuncia.RESUELTA);
      expect(denuncia.tipoResolucion).toBe(tipoResolucion);
      expect(denuncia.version).toBe(3);
    });

    it('no permite resolver una denuncia pendiente', () => {
      const denuncia = crearDenuncia();

      const error = capturarError(() =>
        denuncia.resolver(
          moderadorAsignadoId,
          TipoResolucion.DESCARTADA,
          'La denuncia se descarta porque no corresponde.',
        ),
      );

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('DENUNCIA_DEBE_ESTAR_EN_REVISION');
      expectNoCambioResolucion(denuncia, EstadoDenuncia.PENDIENTE, 1);
    });

    it('no permite resolver si no es el moderador asignado', () => {
      const denuncia = crearDenunciaEnRevision();

      const error = capturarError(() =>
        denuncia.resolver(
          otroModeradorId,
          TipoResolucion.PUBLICACION_ELIMINADA,
          'Se intenta resolver con otro moderador.',
        ),
      );

      expect(error).toBeInstanceOf(ForbiddenException);
      expect(error.message).toBe('SOLO_MODERADOR_ASIGNADO_PUEDE_RESOLVER');
      expectNoCambioResolucion(denuncia, EstadoDenuncia.EN_REVISION, 2);
    });

    it('no permite resolver una denuncia ya resuelta', () => {
      const denuncia = crearDenunciaResuelta();

      const error = capturarError(() =>
        denuncia.resolver(
          moderadorAsignadoId,
          TipoResolucion.PUBLICACION_PAUSADA,
          'Se intenta resolver nuevamente.',
        ),
      );

      expect(error).toBeInstanceOf(BadRequestException);
      expect(error.message).toBe('DENUNCIA_DEBE_ESTAR_EN_REVISION');
      expect(denuncia.estado).toBe(EstadoDenuncia.RESUELTA);
      expect(denuncia.tipoResolucion).toBe(TipoResolucion.DESCARTADA);
      expect(denuncia.detalleResolucion).toBe('La denuncia fue descartada.');
      expect(denuncia.fechaResolucion).toEqual(fechaResolucion);
      expect(denuncia.version).toBe(3);
    });
  });

  function crearDenuncia(datos?: Partial<Denuncia>): Denuncia {
    return Object.assign(new Denuncia(), {
      id: '55555555-5555-4555-8555-555555555555',
      publicacionId: '66666666-6666-4666-8666-666666666666',
      denuncianteId,
      creadorPublicacionId,
      motivo: MotivoDenuncia.CONTENIDO_INAPROPIADO,
      comentario: null,
      estado: EstadoDenuncia.PENDIENTE,
      moderadorAsignadoId: null,
      tipoResolucion: null,
      detalleResolucion: null,
      fechaResolucion: null,
      version: 1,
      fechaCreacion: new Date('2026-06-24T09:00:00.000Z'),
      fechaActualizacion: new Date('2026-06-24T09:00:00.000Z'),
      ...datos,
    });
  }

  function crearDenunciaEnRevision(): Denuncia {
    return crearDenuncia({
      estado: EstadoDenuncia.EN_REVISION,
      moderadorAsignadoId,
      version: 2,
    });
  }

  function crearDenunciaResuelta(): Denuncia {
    return crearDenuncia({
      estado: EstadoDenuncia.RESUELTA,
      moderadorAsignadoId,
      tipoResolucion: TipoResolucion.DESCARTADA,
      detalleResolucion: 'La denuncia fue descartada.',
      fechaResolucion,
      version: 3,
    });
  }

  function expectNoCambioResolucion(
    denuncia: Denuncia,
    estadoEsperado: EstadoDenuncia,
    versionEsperada: number,
  ): void {
    expect(denuncia.estado).toBe(estadoEsperado);
    expect(denuncia.tipoResolucion).toBeNull();
    expect(denuncia.detalleResolucion).toBeNull();
    expect(denuncia.fechaResolucion).toBeNull();
    expect(denuncia.version).toBe(versionEsperada);
  }

  function capturarError(accion: () => void): Error {
    try {
      accion();
    } catch (error: unknown) {
      if (error instanceof Error) {
        return error;
      }

      throw new Error('La acción lanzó un valor que no es Error');
    }

    throw new Error('Se esperaba que la acción lanzara un error');
  }
});
