import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource } from 'typeorm';

import { EventoDominio } from '../../compartidos/evento/eventoDominio';
import { PublicacionService } from '../../publicacion/service/publicacionService';
import { Solicitud } from '../entity/solicitudEntity';
import { EstadoSolicitud } from '../enums/estadoSolicitud';
import { SolicitudRepository } from '../repository/solicitudRepository';
import { SolicitudService } from './solicitudService';

describe('SolicitudService - publicación eliminada', () => {
  let service: SolicitudService;
  let repository: {
    buscarActivasPorPublicacion: jest.Mock;
    guardarVarias: jest.Mock;
  };
  let eventEmitter: {
    emit: jest.Mock;
  };

  beforeEach(() => {
    repository = {
      buscarActivasPorPublicacion: jest.fn(),
      guardarVarias: jest.fn((solicitudes: Solicitud[]) =>
        Promise.resolve(solicitudes),
      ),
    };

    eventEmitter = {
      emit: jest.fn(),
    };

    service = new SolicitudService(
      repository as unknown as SolicitudRepository,
      {} as unknown as PublicacionService,
      eventEmitter as unknown as EventEmitter2,
      {} as unknown as DataSource,
    );
  });

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
});
