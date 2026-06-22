import { ConflictException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';

import { PublicacionService } from '../../publicacion/service/publicacionService';
import UsuarioService from '../../usuario/service/usuarioService';
import { Denuncia } from '../entity/denunciaEntity';
import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { MotivoDenuncia } from '../enums/motivoDenuncia';
import { TipoResolucion } from '../enums/tipoResolucion';
import { DenunciaRepository } from '../repository/denunciaRepository';
import { DenunciaService } from './denunciaService';

describe('DenunciaService - concurrencia', () => {
  let service: DenunciaService;
  let manager: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let publicacionService: {
    pausar: jest.Mock;
    eliminar: jest.Mock;
  };

  beforeEach(() => {
    manager = {
      findOne: jest.fn(),
      save: jest.fn((denuncia: Denuncia) => Promise.resolve(denuncia)),
    };

    publicacionService = {
      pausar: jest.fn(),
      eliminar: jest.fn(),
    };

    const dataSource = {
      transaction: jest.fn(
        async <T>(operacion: (entityManager: EntityManager) => Promise<T>) =>
          operacion(manager as unknown as EntityManager),
      ),
    };

    const usuarioService = {
      BloquearUsuario: jest.fn(),
    };

    service = new DenunciaService(
      {} as DenunciaRepository,
      publicacionService as unknown as PublicacionService,
      usuarioService as unknown as UsuarioService,
      dataSource as unknown as DataSource,
    );
  });

  it('toma la denuncia después de bloquear su fila', async () => {
    const denuncia = crearDenuncia();
    manager.findOne.mockResolvedValue(denuncia);

    const resultado = await service.tomarDenuncia(
      denuncia.id,
      '22222222-2222-4222-8222-222222222222',
      { version: 1 },
    );

    expect(manager.findOne).toHaveBeenCalledWith(Denuncia, {
      where: { id: denuncia.id },
      lock: { mode: 'pessimistic_write' },
    });
    expect(manager.save).toHaveBeenCalledWith(denuncia);
    expect(resultado.estado).toBe(EstadoDenuncia.EN_REVISION);
    expect(resultado.version).toBe(2);
  });

  it('rechaza una versión vencida sin guardar cambios', async () => {
    const denuncia = crearDenuncia();
    denuncia.version = 2;
    manager.findOne.mockResolvedValue(denuncia);

    await expect(
      service.tomarDenuncia(
        denuncia.id,
        '22222222-2222-4222-8222-222222222222',
        { version: 1 },
      ),
    ).rejects.toThrow(ConflictException);

    expect(manager.save).not.toHaveBeenCalled();
    expect(denuncia.estado).toBe(EstadoDenuncia.PENDIENTE);
  });

  it('no ejecuta una sanción cuando la versión de resolución está vencida', async () => {
    const denuncia = crearDenuncia();
    denuncia.version = 2;
    manager.findOne.mockResolvedValue(denuncia);

    await expect(
      service.resolverDenuncia(
        denuncia.id,
        '22222222-2222-4222-8222-222222222222',
        {
          version: 1,
          tipoResolucion: TipoResolucion.PUBLICACION_PAUSADA,
          detalleResolucion:
            'La resolución quedó desactualizada por otra operación.',
        },
      ),
    ).rejects.toThrow('CONFLICTO_CONCURRENCIA');

    expect(publicacionService.pausar).not.toHaveBeenCalled();
    expect(manager.save).not.toHaveBeenCalled();
  });

  function crearDenuncia(): Denuncia {
    return Object.assign(new Denuncia(), {
      id: '11111111-1111-4111-8111-111111111111',
      publicacionId: '33333333-3333-4333-8333-333333333333',
      denuncianteId: '44444444-4444-4444-8444-444444444444',
      creadorPublicacionId: '55555555-5555-4555-8555-555555555555',
      motivo: MotivoDenuncia.CONTENIDO_INAPROPIADO,
      comentario: null,
      estado: EstadoDenuncia.PENDIENTE,
      moderadorAsignadoId: null,
      tipoResolucion: null,
      detalleResolucion: null,
      fechaResolucion: null,
      version: 1,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    });
  }
});
