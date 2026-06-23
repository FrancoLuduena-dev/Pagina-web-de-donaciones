import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, EntityManager } from 'typeorm';

import { EventoDominio } from '../../compartidos/evento/eventoDominio';
import { Publicacion } from '../../publicacion/entity/publicacionEntity';
import { EstadoPublicacion } from '../../publicacion/enums/estadoPublicacion';
import { PublicacionService } from '../../publicacion/service/publicacionService';
import { Solicitud } from '../entity/solicitudEntity';
import { EstadoSolicitud } from '../enums/estadoSolicitud';
import { SolicitudRepository } from '../repository/solicitudRepository';
import { SolicitudService } from './solicitudService';

describe('SolicitudService', () => {
  let service: SolicitudService;
  let repository: {
    buscarActivasPorPublicacion: jest.Mock;
    buscarPorId: jest.Mock;
    guardarVarias: jest.Mock;
  };
  let eventEmitter: {
    emit: jest.Mock;
  };
  let manager: {
    findOne: jest.Mock;
    save: jest.Mock;
  };
  let dataSource: {
    transaction: jest.Mock;
  };

  beforeEach(() => {
    repository = {
      buscarActivasPorPublicacion: jest.fn(),
      buscarPorId: jest.fn(),
      guardarVarias: jest.fn((solicitudes: Solicitud[]) =>
        Promise.resolve(solicitudes),
      ),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    manager = {
      findOne: jest.fn(),
      save: jest.fn((entidad: Solicitud | Publicacion) =>
        Promise.resolve(entidad),
      ),
    };

    dataSource = {
      transaction: jest.fn(
        async <T>(operacion: (entityManager: EntityManager) => Promise<T>) =>
          operacion(manager as unknown as EntityManager),
      ),
    };

    service = new SolicitudService(
      repository as unknown as SolicitudRepository,
      {} as unknown as PublicacionService,
      eventEmitter as unknown as EventEmitter2,
      dataSource as unknown as DataSource,
    );
  });

  describe('aceptarSolicitud', () => {
    it('bloquea, valida y guarda la solicitud y la publicación en una transacción', async () => {
      const solicitud = crearSolicitud(
        '11111111-1111-4111-8111-111111111111',
        EstadoSolicitud.PENDIENTE,
      );
      const publicacion = crearPublicacion(EstadoPublicacion.DISPONIBLE);
      manager.findOne
        .mockResolvedValueOnce(solicitud)
        .mockResolvedValueOnce(publicacion);
      repository.buscarPorId.mockImplementation(() => {
        solicitud.publicacion = publicacion;
        return Promise.resolve(solicitud);
      });

      const resultado = await service.aceptarSolicitud(
        solicitud.id,
        solicitud.creadorPublicacionId,
      );

      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(manager.findOne).toHaveBeenNthCalledWith(1, Solicitud, {
        where: { id: solicitud.id },
        lock: { mode: 'pessimistic_write' },
      });
      expect(manager.findOne).toHaveBeenNthCalledWith(2, Publicacion, {
        where: { id: solicitud.publicacionId },
        lock: { mode: 'pessimistic_write' },
      });
      expect(manager.save).toHaveBeenNthCalledWith(1, publicacion);
      expect(manager.save).toHaveBeenNthCalledWith(2, solicitud);
      expect(solicitud.estado).toBe(EstadoSolicitud.ACEPTADA);
      expect(publicacion.estado).toBe(EstadoPublicacion.RESERVADA);
      expect(resultado.estado).toBe(EstadoSolicitud.ACEPTADA);
      expect(repository.buscarPorId).toHaveBeenCalledWith(solicitud.id);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.SOLICITUD_ACEPTADA,
        expect.objectContaining({
          solicitudId: solicitud.id,
          destinatarioId: solicitud.solicitanteId,
          publicacionTitulo: publicacion.titulo,
        }),
      );

      const ultimoGuardado = manager.save.mock.invocationCallOrder.at(-1);
      const emisionEvento = eventEmitter.emit.mock.invocationCallOrder[0];

      expect(ultimoGuardado).toBeDefined();
      expect(emisionEvento).toBeGreaterThan(ultimoGuardado!);
    });

    it('rechaza la segunda aceptación si la publicación ya está reservada', async () => {
      const solicitud = crearSolicitud(
        '22222222-2222-4222-8222-222222222222',
        EstadoSolicitud.PENDIENTE,
      );
      const publicacion = crearPublicacion(EstadoPublicacion.RESERVADA);
      manager.findOne
        .mockResolvedValueOnce(solicitud)
        .mockResolvedValueOnce(publicacion);

      await expect(
        service.aceptarSolicitud(solicitud.id, solicitud.creadorPublicacionId),
      ).rejects.toThrow(
        'La publicación no está disponible para recibir solicitudes',
      );

      expect(manager.findOne).toHaveBeenNthCalledWith(2, Publicacion, {
        where: { id: solicitud.publicacionId },
        lock: { mode: 'pessimistic_write' },
      });
      expect(manager.save).not.toHaveBeenCalled();
      expect(repository.buscarPorId).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
      expect(solicitud.estado).toBe(EstadoSolicitud.PENDIENTE);
      expect(publicacion.estado).toBe(EstadoPublicacion.RESERVADA);
    });

    it('no busca ni modifica la publicación si el usuario no es su creador', async () => {
      const solicitud = crearSolicitud(
        '33333333-3333-4333-8333-333333333333',
        EstadoSolicitud.PENDIENTE,
      );
      manager.findOne.mockResolvedValueOnce(solicitud);

      await expect(
        service.aceptarSolicitud(
          solicitud.id,
          '99999999-9999-4999-8999-999999999999',
        ),
      ).rejects.toThrow('Solo el creador puede aceptar solicitudes');

      expect(manager.findOne).toHaveBeenCalledTimes(1);
      expect(manager.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
      expect(solicitud.estado).toBe(EstadoSolicitud.PENDIENTE);
    });

    it('no busca la publicación ni notifica si la solicitud no existe', async () => {
      manager.findOne.mockResolvedValueOnce(null);

      await expect(
        service.aceptarSolicitud(
          '44444444-4444-4444-8444-444444444444',
          '77777777-7777-4777-8777-777777777777',
        ),
      ).rejects.toThrow('Solicitud no encontrada');

      expect(manager.findOne).toHaveBeenCalledTimes(1);
      expect(manager.save).not.toHaveBeenCalled();
      expect(repository.buscarPorId).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('no modifica ni notifica si la publicación no existe', async () => {
      const solicitud = crearSolicitud(
        '55555555-5555-4555-8555-555555555555',
        EstadoSolicitud.PENDIENTE,
      );
      manager.findOne
        .mockResolvedValueOnce(solicitud)
        .mockResolvedValueOnce(null);

      await expect(
        service.aceptarSolicitud(solicitud.id, solicitud.creadorPublicacionId),
      ).rejects.toThrow('Publicación no encontrada');

      expect(manager.save).not.toHaveBeenCalled();
      expect(repository.buscarPorId).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
      expect(solicitud.estado).toBe(EstadoSolicitud.PENDIENTE);
    });

    it('no notifica si falla el guardado de la publicación', async () => {
      const solicitud = crearSolicitud(
        '66666666-6666-4666-8666-666666666666',
        EstadoSolicitud.PENDIENTE,
      );
      const publicacion = crearPublicacion(EstadoPublicacion.DISPONIBLE);
      manager.findOne
        .mockResolvedValueOnce(solicitud)
        .mockResolvedValueOnce(publicacion);
      manager.save.mockRejectedValueOnce(
        new Error('No se pudo guardar la publicación'),
      );

      await expect(
        service.aceptarSolicitud(solicitud.id, solicitud.creadorPublicacionId),
      ).rejects.toThrow('No se pudo guardar la publicación');

      expect(manager.save).toHaveBeenCalledTimes(1);
      expect(repository.buscarPorId).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('no notifica si falla el guardado de la solicitud', async () => {
      const solicitud = crearSolicitud(
        '77777777-7777-4777-8777-777777777777',
        EstadoSolicitud.PENDIENTE,
      );
      const publicacion = crearPublicacion(EstadoPublicacion.DISPONIBLE);
      manager.findOne
        .mockResolvedValueOnce(solicitud)
        .mockResolvedValueOnce(publicacion);
      manager.save
        .mockResolvedValueOnce(publicacion)
        .mockRejectedValueOnce(new Error('No se pudo guardar la solicitud'));

      await expect(
        service.aceptarSolicitud(solicitud.id, solicitud.creadorPublicacionId),
      ).rejects.toThrow('No se pudo guardar la solicitud');

      expect(manager.save).toHaveBeenCalledTimes(2);
      expect(repository.buscarPorId).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('publicación eliminada', () => {
    it('rechaza pendientes y cancela la aceptada cuando elimina moderación', async () => {
      const pendiente = crearSolicitud(
        '11111111-1111-4111-8111-111111111111',
        EstadoSolicitud.PENDIENTE,
      );
      const aceptada = crearSolicitud(
        '22222222-2222-4222-8222-222222222222',
        EstadoSolicitud.ACEPTADA,
      );
      repository.buscarActivasPorPublicacion.mockResolvedValue([
        pendiente,
        aceptada,
      ]);

      const cantidad = await service.resolverSolicitudesPorPublicacionEliminada(
        pendiente.publicacionId,
        'Publicación eliminada',
        true,
      );

      expect(cantidad).toBe(2);
      expect(repository.guardarVarias).toHaveBeenCalledWith([
        pendiente,
        aceptada,
      ]);
      expect(pendiente.estado).toBe(EstadoSolicitud.RECHAZADA);
      expect(pendiente.motivoRechazo).toBe(
        'La publicación fue eliminada por moderación',
      );
      expect(aceptada.estado).toBe(EstadoSolicitud.CANCELADA);
      expect(aceptada.motivoCancelacion).toBe(
        'La publicación fue eliminada por moderación',
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.SOLICITUD_RECHAZADA,
        expect.objectContaining({ solicitudId: pendiente.id }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.SOLICITUD_ACEPTADA_CANCELADA,
        expect.objectContaining({ solicitudId: aceptada.id }),
      );
    });

    it('al eliminar el creador rechaza pendientes y cancela una aceptada concurrente', async () => {
      const pendiente = crearSolicitud(
        '11111111-1111-4111-8111-111111111111',
        EstadoSolicitud.PENDIENTE,
      );
      const aceptada = crearSolicitud(
        '22222222-2222-4222-8222-222222222222',
        EstadoSolicitud.ACEPTADA,
      );
      repository.buscarActivasPorPublicacion.mockResolvedValue([
        pendiente,
        aceptada,
      ]);

      const cantidad = await service.resolverSolicitudesPorPublicacionEliminada(
        pendiente.publicacionId,
        'Publicación eliminada',
        false,
      );

      expect(cantidad).toBe(2);
      expect(pendiente.estado).toBe(EstadoSolicitud.RECHAZADA);
      expect(pendiente.motivoRechazo).toBe('La publicación fue eliminada');
      expect(aceptada.estado).toBe(EstadoSolicitud.CANCELADA);
      expect(aceptada.motivoCancelacion).toBe('La publicación fue eliminada');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.SOLICITUD_ACEPTADA_CANCELADA,
        expect.objectContaining({ solicitudId: aceptada.id }),
      );
    });

    it('no modifica solicitudes que ya tienen un estado final', async () => {
      const finalizadas = [
        crearSolicitud(
          '11111111-1111-4111-8111-111111111111',
          EstadoSolicitud.RECHAZADA,
        ),
        crearSolicitud(
          '22222222-2222-4222-8222-222222222222',
          EstadoSolicitud.CANCELADA,
        ),
        crearSolicitud(
          '33333333-3333-4333-8333-333333333333',
          EstadoSolicitud.FINALIZADA,
        ),
        crearSolicitud(
          '44444444-4444-4444-8444-444444444444',
          EstadoSolicitud.EXPIRADA,
        ),
      ];
      repository.buscarActivasPorPublicacion.mockResolvedValue(finalizadas);

      const cantidad = await service.resolverSolicitudesPorPublicacionEliminada(
        finalizadas[0].publicacionId,
        'Publicación eliminada',
        true,
      );

      expect(cantidad).toBe(0);
      expect(repository.guardarVarias).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('no guarda ni notifica cuando no existen solicitudes activas', async () => {
      repository.buscarActivasPorPublicacion.mockResolvedValue([]);

      const cantidad = await service.resolverSolicitudesPorPublicacionEliminada(
        '55555555-5555-4555-8555-555555555555',
        'Publicación eliminada',
        true,
      );

      expect(cantidad).toBe(0);
      expect(repository.guardarVarias).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('no notifica si falla el guardado de las solicitudes', async () => {
      const pendiente = crearSolicitud(
        '11111111-1111-4111-8111-111111111111',
        EstadoSolicitud.PENDIENTE,
      );
      repository.buscarActivasPorPublicacion.mockResolvedValue([pendiente]);
      repository.guardarVarias.mockRejectedValue(
        new Error('No se pudieron guardar las solicitudes'),
      );

      await expect(
        service.resolverSolicitudesPorPublicacionEliminada(
          pendiente.publicacionId,
          'Publicación eliminada',
          true,
        ),
      ).rejects.toThrow('No se pudieron guardar las solicitudes');

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  function crearSolicitud(id: string, estado: EstadoSolicitud): Solicitud {
    return Object.assign(new Solicitud(), {
      id,
      publicacionId: '55555555-5555-4555-8555-555555555555',
      solicitanteId: '66666666-6666-4666-8666-666666666666',
      creadorPublicacionId: '77777777-7777-4777-8777-777777777777',
      mensaje: null,
      estado,
      motivoRechazo: null,
      motivoCancelacion: null,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  function crearPublicacion(estado: EstadoPublicacion): Publicacion {
    return Object.assign(new Publicacion(), {
      id: '55555555-5555-4555-8555-555555555555',
      creadorId: '77777777-7777-4777-8777-777777777777',
      titulo: 'Publicación de prueba',
      estado,
      version: 1,
      deletedAt: null,
    });
  }
});
