import { EventEmitter2 } from '@nestjs/event-emitter';
import { DataSource, EntityManager } from 'typeorm';

import { EventoDominio } from '../../compartidos/evento/eventoDominio';
import { Publicacion } from '../../publicacion/entity/publicacionEntity';
import { EstadoPublicacion } from '../../publicacion/enums/estadoPublicacion';
import { PublicacionService } from '../../publicacion/service/publicacionService';
import { CancelarSolicitudDto } from '../dtos/cancelarSolicitudDto';
import { CrearSolicitudDto } from '../dtos/crearSolicitudDto';
import { RechazarSolicitudDto } from '../dtos/rechazarSolicitudDto';
import { SolicitudResponseDto } from '../dtos/solicitudResponse';
import { Solicitud } from '../entity/solicitudEntity';
import { EstadoSolicitud } from '../enums/estadoSolicitud';
import { SolicitudRepository } from '../repository/solicitudRepository';
import { SolicitudService } from './solicitudService';

type SolicitudRepositoryMock = {
  crear: jest.Mock<Solicitud, [Partial<Solicitud>]>;
  guardar: jest.Mock<Promise<Solicitud>, [Solicitud]>;
  guardarVarias: jest.Mock<Promise<Solicitud[]>, [Solicitud[]]>;
  buscarPorId: jest.Mock<Promise<Solicitud | null>, [string]>;
  buscarSolicitudActiva: jest.Mock<Promise<Solicitud | null>, [string, string]>;
  listarMias: jest.Mock<Promise<Solicitud[]>, [string]>;
  listarRecibidas: jest.Mock<Promise<Solicitud[]>, [string]>;
  buscarPendientesPorPublicacion: jest.Mock<Promise<Solicitud[]>, [string]>;
  buscarActivasPorPublicacion: jest.Mock<Promise<Solicitud[]>, [string]>;
  buscarAceptadaPorPublicacion: jest.Mock<Promise<Solicitud | null>, [string]>;
};

type PublicacionServiceMock = {
  buscarPublicacionPorId: jest.Mock<Promise<Publicacion>, [string]>;
};

type EventEmitterMock = {
  emit: jest.Mock<boolean, [string | symbol, ...unknown[]]>;
};

type ManagerMock = {
  findOne: jest.Mock<
    Promise<Solicitud | Publicacion | null>,
    [typeof Solicitud | typeof Publicacion, unknown]
  >;
  find: jest.Mock<Promise<Solicitud[]>, [typeof Solicitud, unknown]>;
  save: jest.Mock<
    Promise<Solicitud | Publicacion | Solicitud[]>,
    [Solicitud | Publicacion | Solicitud[]]
  >;
};

type DataSourceMock = {
  transaction: jest.Mock<
    Promise<unknown>,
    [(manager: EntityManager) => Promise<unknown>]
  >;
};

describe('SolicitudService', () => {
  let service: SolicitudService;
  let repository: SolicitudRepositoryMock;
  let publicacionService: PublicacionServiceMock;
  let eventEmitter: EventEmitterMock;
  let manager: ManagerMock;
  let dataSource: DataSourceMock;

  beforeEach(() => {
    repository = crearRepositoryMock();
    publicacionService = crearPublicacionServiceMock();
    eventEmitter = crearEventEmitterMock();
    manager = crearManagerMock();

    dataSource = {
      transaction: jest.fn(
        async (
          operacion: (entityManager: EntityManager) => Promise<unknown>,
        ): Promise<unknown> => operacion(manager as unknown as EntityManager),
      ),
    };

    service = new SolicitudService(
      repository as unknown as SolicitudRepository,
      publicacionService as unknown as PublicacionService,
      eventEmitter as unknown as EventEmitter2,
      dataSource as unknown as DataSource,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('crearSolicitud', () => {
    it('crea, guarda, notifica y devuelve una solicitud mapeada', async () => {
      const dto: CrearSolicitudDto = {
        publicacionId: 'publicacion-1',
        mensaje: 'Me interesa retirar la donación.',
      };
      const publicacion = crearPublicacion({
        id: dto.publicacionId,
        creadorId: 'usuario-creador',
        titulo: 'Mesa de madera',
        estado: EstadoPublicacion.DISPONIBLE,
      });
      const solicitudCreada = crearSolicitud({
        id: 'solicitud-creada',
        publicacionId: dto.publicacionId,
        solicitanteId: 'usuario-solicitante',
        creadorPublicacionId: 'usuario-creador',
        mensaje: dto.mensaje,
        publicacion,
      });

      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);
      repository.buscarSolicitudActiva.mockResolvedValue(null);
      repository.crear.mockReturnValue(solicitudCreada);
      repository.guardar.mockResolvedValue(solicitudCreada);
      repository.buscarPorId.mockResolvedValue(solicitudCreada);

      const resultado = await service.crearSolicitud(
        dto,
        'usuario-solicitante',
      );

      expect(publicacionService.buscarPublicacionPorId).toHaveBeenCalledWith(
        dto.publicacionId,
      );
      expect(repository.buscarSolicitudActiva).toHaveBeenCalledWith(
        dto.publicacionId,
        'usuario-solicitante',
      );
      expect(repository.crear).toHaveBeenCalledWith({
        publicacionId: dto.publicacionId,
        solicitanteId: 'usuario-solicitante',
        creadorPublicacionId: 'usuario-creador',
        mensaje: dto.mensaje,
      });
      expect(repository.guardar).toHaveBeenCalledWith(solicitudCreada);
      expect(repository.buscarPorId).toHaveBeenCalledWith('solicitud-creada');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.SOLICITUD_CREADA,
        expect.objectContaining({
          solicitudId: 'solicitud-creada',
          destinatarioId: 'usuario-creador',
          publicacionTitulo: 'Mesa de madera',
        }),
      );
      expect(resultado).toMatchObject({
        id: 'solicitud-creada',
        publicacionId: dto.publicacionId,
        solicitanteId: 'usuario-solicitante',
        creadorPublicacionId: 'usuario-creador',
        estado: EstadoSolicitud.PENDIENTE,
        mensaje: dto.mensaje,
      });
    });

    it('rechaza crear una solicitud sobre una publicación propia', async () => {
      const publicacion = crearPublicacion({
        creadorId: 'usuario-creador',
        estado: EstadoPublicacion.DISPONIBLE,
      });

      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);

      await expect(
        service.crearSolicitud(
          {
            publicacionId: publicacion.id,
            mensaje: 'Me interesa.',
          },
          'usuario-creador',
        ),
      ).rejects.toThrow('No podés solicitar tu propia publicación');

      expect(repository.buscarSolicitudActiva).not.toHaveBeenCalled();
      expect(repository.crear).not.toHaveBeenCalled();
      expect(repository.guardar).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('rechaza crear una solicitud cuando la publicación no está disponible', async () => {
      const publicacion = crearPublicacion({
        estado: EstadoPublicacion.RESERVADA,
      });

      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);

      await expect(
        service.crearSolicitud(
          {
            publicacionId: publicacion.id,
          },
          'usuario-solicitante',
        ),
      ).rejects.toThrow(
        'La publicación no está disponible para recibir solicitudes',
      );

      expect(repository.buscarSolicitudActiva).not.toHaveBeenCalled();
      expect(repository.crear).not.toHaveBeenCalled();
      expect(repository.guardar).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('rechaza crear una solicitud si ya existe una activa', async () => {
      const publicacion = crearPublicacion({
        estado: EstadoPublicacion.DISPONIBLE,
      });
      const solicitudActiva = crearSolicitud({
        publicacionId: publicacion.id,
        solicitanteId: 'usuario-solicitante',
        estado: EstadoSolicitud.PENDIENTE,
      });

      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);
      repository.buscarSolicitudActiva.mockResolvedValue(solicitudActiva);

      await expect(
        service.crearSolicitud(
          {
            publicacionId: publicacion.id,
          },
          'usuario-solicitante',
        ),
      ).rejects.toThrow('Ya tenés una solicitud activa para esta publicación');

      expect(repository.crear).not.toHaveBeenCalled();
      expect(repository.guardar).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('listados', () => {
    it('lista mis solicitudes mapeadas para el solicitante autenticado', async () => {
      const solicitud = crearSolicitud({
        id: 'solicitud-mia',
        solicitanteId: 'usuario-solicitante',
      });

      repository.listarMias.mockResolvedValue([solicitud]);

      const resultado = await service.listarMisSolicitudes(
        'usuario-solicitante',
      );

      expect(repository.listarMias).toHaveBeenCalledWith('usuario-solicitante');
      expect(resultado).toEqual([
        expect.objectContaining({
          id: 'solicitud-mia',
          solicitanteId: 'usuario-solicitante',
        }),
      ]);
    });

    it('lista solicitudes recibidas mapeadas para el creador autenticado', async () => {
      const solicitud = crearSolicitud({
        id: 'solicitud-recibida',
        creadorPublicacionId: 'usuario-creador',
      });

      repository.listarRecibidas.mockResolvedValue([solicitud]);

      const resultado =
        await service.listarSolicitudesRecibidas('usuario-creador');

      expect(repository.listarRecibidas).toHaveBeenCalledWith(
        'usuario-creador',
      );
      expect(resultado).toEqual([
        expect.objectContaining({
          id: 'solicitud-recibida',
          creadorPublicacionId: 'usuario-creador',
        }),
      ]);
    });
  });

  describe('rechazarSolicitud', () => {
    it('rechaza una solicitud pendiente, guarda y notifica al solicitante', async () => {
      const solicitud = crearSolicitud({
        id: 'solicitud-1',
        estado: EstadoSolicitud.PENDIENTE,
        creadorPublicacionId: 'usuario-creador',
        publicacion: crearPublicacion({
          titulo: 'Mesa de madera',
        }),
      });
      const dto: RechazarSolicitudDto = {
        motivo: 'Ya fue reservada por otra persona',
      };

      repository.buscarPorId.mockResolvedValue(solicitud);
      repository.guardar.mockResolvedValue(solicitud);

      const resultado = await service.rechazarSolicitud(
        solicitud.id,
        'usuario-creador',
        dto,
      );

      expect(solicitud.estado).toBe(EstadoSolicitud.RECHAZADA);
      expect(solicitud.motivoRechazo).toBe(dto.motivo);
      expect(repository.guardar).toHaveBeenCalledWith(solicitud);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.SOLICITUD_RECHAZADA,
        expect.objectContaining({
          solicitudId: solicitud.id,
          destinatarioId: solicitud.solicitanteId,
          publicacionTitulo: 'Mesa de madera',
          motivo: dto.motivo,
        }),
      );
      expect(resultado.estado).toBe(EstadoSolicitud.RECHAZADA);
    });

    it('rechaza la operación si el usuario no es creador de la publicación', async () => {
      const solicitud = crearSolicitud({
        creadorPublicacionId: 'usuario-creador',
      });

      repository.buscarPorId.mockResolvedValue(solicitud);

      await expect(
        service.rechazarSolicitud(solicitud.id, 'otro-usuario', {
          motivo: 'No corresponde',
        }),
      ).rejects.toThrow('Solo el creador puede rechazar solicitudes');

      expect(repository.guardar).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si la solicitud no existe', async () => {
      repository.buscarPorId.mockResolvedValue(null);

      await expect(
        service.rechazarSolicitud('solicitud-inexistente', 'usuario-creador', {
          motivo: 'No corresponde',
        }),
      ).rejects.toThrow('Solicitud no encontrada');

      expect(repository.guardar).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('aceptarSolicitud', () => {
    it('bloquea, valida y guarda la solicitud y la publicación en una transacción', async () => {
      const solicitud = crearSolicitud({
        id: 'solicitud-aceptada',
        estado: EstadoSolicitud.PENDIENTE,
        creadorPublicacionId: 'usuario-creador',
      });
      const publicacion = crearPublicacion({
        id: solicitud.publicacionId,
        creadorId: solicitud.creadorPublicacionId,
        titulo: 'Publicación de prueba',
        estado: EstadoPublicacion.DISPONIBLE,
      });
      solicitud.publicacion = publicacion;

      manager.findOne
        .mockResolvedValueOnce(solicitud)
        .mockResolvedValueOnce(publicacion);
      repository.buscarPorId.mockResolvedValue(solicitud);

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
      const solicitud = crearSolicitud({
        estado: EstadoSolicitud.PENDIENTE,
      });
      const publicacion = crearPublicacion({
        id: solicitud.publicacionId,
        estado: EstadoPublicacion.RESERVADA,
      });

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
      const solicitud = crearSolicitud({
        estado: EstadoSolicitud.PENDIENTE,
      });

      manager.findOne.mockResolvedValueOnce(solicitud);

      await expect(
        service.aceptarSolicitud(solicitud.id, 'otro-usuario'),
      ).rejects.toThrow('Solo el creador puede aceptar solicitudes');

      expect(manager.findOne).toHaveBeenCalledTimes(1);
      expect(manager.save).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
      expect(solicitud.estado).toBe(EstadoSolicitud.PENDIENTE);
    });

    it('no busca la publicación ni notifica si la solicitud no existe', async () => {
      manager.findOne.mockResolvedValueOnce(null);

      await expect(
        service.aceptarSolicitud('solicitud-inexistente', 'usuario-creador'),
      ).rejects.toThrow('Solicitud no encontrada');

      expect(manager.findOne).toHaveBeenCalledTimes(1);
      expect(manager.save).not.toHaveBeenCalled();
      expect(repository.buscarPorId).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('no modifica ni notifica si la publicación no existe', async () => {
      const solicitud = crearSolicitud({
        estado: EstadoSolicitud.PENDIENTE,
      });

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
      const solicitud = crearSolicitud({
        estado: EstadoSolicitud.PENDIENTE,
      });
      const publicacion = crearPublicacion({
        id: solicitud.publicacionId,
        estado: EstadoPublicacion.DISPONIBLE,
      });

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
      const solicitud = crearSolicitud({
        estado: EstadoSolicitud.PENDIENTE,
      });
      const publicacion = crearPublicacion({
        id: solicitud.publicacionId,
        estado: EstadoPublicacion.DISPONIBLE,
      });

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

  describe('finalizarSolicitud', () => {
    it('finaliza una solicitud aceptada, entrega la publicación y rechaza pendientes restantes', async () => {
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        titulo: 'Mesa de madera',
        estado: EstadoPublicacion.RESERVADA,
      });
      const solicitudAceptada = crearSolicitud({
        id: 'solicitud-aceptada',
        publicacionId: publicacion.id,
        creadorPublicacionId: 'usuario-creador',
        estado: EstadoSolicitud.ACEPTADA,
        publicacion,
      });
      const pendiente1 = crearSolicitud({
        id: 'pendiente-1',
        publicacionId: publicacion.id,
        estado: EstadoSolicitud.PENDIENTE,
      });
      const pendiente2 = crearSolicitud({
        id: 'pendiente-2',
        publicacionId: publicacion.id,
        estado: EstadoSolicitud.PENDIENTE,
      });

      repository.buscarPorId.mockResolvedValue(solicitudAceptada);
      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);
      manager.find.mockResolvedValue([pendiente1, pendiente2]);

      const resultado = await service.finalizarSolicitud(
        solicitudAceptada.id,
        'usuario-creador',
      );

      expect(publicacionService.buscarPublicacionPorId).toHaveBeenCalledWith(
        publicacion.id,
      );
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(manager.find).toHaveBeenCalledWith(Solicitud, {
        where: {
          publicacionId: publicacion.id,
          estado: EstadoSolicitud.PENDIENTE,
        },
      });
      expect(manager.save).toHaveBeenNthCalledWith(1, [pendiente1, pendiente2]);
      expect(manager.save).toHaveBeenNthCalledWith(2, publicacion);
      expect(manager.save).toHaveBeenNthCalledWith(3, solicitudAceptada);
      expect(solicitudAceptada.estado).toBe(EstadoSolicitud.FINALIZADA);
      expect(publicacion.estado).toBe(EstadoPublicacion.ENTREGADA);
      expect(pendiente1.estado).toBe(EstadoSolicitud.RECHAZADA);
      expect(pendiente1.motivoRechazo).toBe('La publicación ya fue entregada');
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.SOLICITUD_RECHAZADA,
        expect.objectContaining({
          solicitudId: pendiente1.id,
          destinatarioId: pendiente1.solicitanteId,
          publicacionTitulo: publicacion.titulo,
          motivo: 'La publicación ya fue entregada',
        }),
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.SOLICITUD_FINALIZADA,
        expect.objectContaining({
          solicitudId: solicitudAceptada.id,
          destinatarioId: solicitudAceptada.solicitanteId,
          publicacionTitulo: publicacion.titulo,
        }),
      );
      expect(resultado.estado).toBe(EstadoSolicitud.FINALIZADA);
    });

    it('finaliza sin intentar guardar pendientes cuando no hay solicitudes pendientes', async () => {
      const publicacion = crearPublicacion({
        estado: EstadoPublicacion.RESERVADA,
      });
      const solicitudAceptada = crearSolicitud({
        estado: EstadoSolicitud.ACEPTADA,
        publicacionId: publicacion.id,
        creadorPublicacionId: 'usuario-creador',
      });

      repository.buscarPorId.mockResolvedValue(solicitudAceptada);
      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);
      manager.find.mockResolvedValue([]);

      await service.finalizarSolicitud(solicitudAceptada.id, 'usuario-creador');

      expect(manager.save).toHaveBeenCalledTimes(2);
      expect(manager.save).toHaveBeenNthCalledWith(1, publicacion);
      expect(manager.save).toHaveBeenNthCalledWith(2, solicitudAceptada);
      expect(eventEmitter.emit).toHaveBeenCalledTimes(1);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.SOLICITUD_FINALIZADA,
        expect.anything(),
      );
    });

    it('rechaza finalizar si el usuario no es el creador', async () => {
      const solicitudAceptada = crearSolicitud({
        estado: EstadoSolicitud.ACEPTADA,
        creadorPublicacionId: 'usuario-creador',
      });

      repository.buscarPorId.mockResolvedValue(solicitudAceptada);

      await expect(
        service.finalizarSolicitud(solicitudAceptada.id, 'otro-usuario'),
      ).rejects.toThrow('Solo el creador puede finalizar la entrega');

      expect(publicacionService.buscarPublicacionPorId).not.toHaveBeenCalled();
      expect(dataSource.transaction).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('no notifica si falla la transacción de finalización', async () => {
      const publicacion = crearPublicacion({
        estado: EstadoPublicacion.RESERVADA,
      });
      const solicitudAceptada = crearSolicitud({
        estado: EstadoSolicitud.ACEPTADA,
        publicacionId: publicacion.id,
        creadorPublicacionId: 'usuario-creador',
      });

      repository.buscarPorId.mockResolvedValue(solicitudAceptada);
      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);
      manager.find.mockResolvedValue([]);
      manager.save.mockRejectedValueOnce(new Error('No se pudo guardar'));

      await expect(
        service.finalizarSolicitud(solicitudAceptada.id, 'usuario-creador'),
      ).rejects.toThrow('No se pudo guardar');

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('acciones por publicación', () => {
    it('finaliza la entrega buscando la solicitud aceptada por publicación', async () => {
      const solicitudAceptada = crearSolicitud({
        id: 'solicitud-aceptada',
        estado: EstadoSolicitud.ACEPTADA,
      });
      const respuesta = crearRespuesta({ id: solicitudAceptada.id });

      repository.buscarAceptadaPorPublicacion.mockResolvedValue(
        solicitudAceptada,
      );

      const finalizarSolicitudSpy = jest
        .spyOn(service, 'finalizarSolicitud')
        .mockResolvedValue(respuesta);

      await expect(
        service.finalizarEntregaPorPublicacion(
          solicitudAceptada.publicacionId,
          'usuario-creador',
        ),
      ).resolves.toBe(respuesta);

      expect(repository.buscarAceptadaPorPublicacion).toHaveBeenCalledWith(
        solicitudAceptada.publicacionId,
      );
      expect(finalizarSolicitudSpy).toHaveBeenCalledWith(
        solicitudAceptada.id,
        'usuario-creador',
      );
    });

    it('lanza NotFoundException al finalizar por publicación si no hay solicitud aceptada', async () => {
      repository.buscarAceptadaPorPublicacion.mockResolvedValue(null);

      await expect(
        service.finalizarEntregaPorPublicacion(
          'publicacion-sin-reserva',
          'usuario-creador',
        ),
      ).rejects.toThrow('No hay una solicitud aceptada para esta publicación');
    });

    it('cancela la reserva buscando la solicitud aceptada por publicación', async () => {
      const solicitudAceptada = crearSolicitud({
        id: 'solicitud-aceptada',
        estado: EstadoSolicitud.ACEPTADA,
      });
      const dto: CancelarSolicitudDto = {
        motivo: 'No se pudo coordinar la entrega',
      };
      const respuesta = crearRespuesta({ id: solicitudAceptada.id });

      repository.buscarAceptadaPorPublicacion.mockResolvedValue(
        solicitudAceptada,
      );

      const cancelarSolicitudSpy = jest
        .spyOn(service, 'cancelarSolicitud')
        .mockResolvedValue(respuesta);

      await expect(
        service.cancelarReservaPorPublicacion(
          solicitudAceptada.publicacionId,
          'usuario-creador',
          dto,
        ),
      ).resolves.toBe(respuesta);

      expect(repository.buscarAceptadaPorPublicacion).toHaveBeenCalledWith(
        solicitudAceptada.publicacionId,
      );
      expect(cancelarSolicitudSpy).toHaveBeenCalledWith(
        solicitudAceptada.id,
        'usuario-creador',
        dto,
      );
    });

    it('lanza NotFoundException al cancelar reserva por publicación si no hay solicitud aceptada', async () => {
      repository.buscarAceptadaPorPublicacion.mockResolvedValue(null);

      await expect(
        service.cancelarReservaPorPublicacion(
          'publicacion-sin-reserva',
          'usuario-creador',
          {},
        ),
      ).rejects.toThrow('No hay una solicitud aceptada para esta publicación');
    });
  });

  describe('cancelarSolicitud', () => {
    it('cancela una solicitud pendiente cuando la acción la realiza el solicitante', async () => {
      const solicitudPendiente = crearSolicitud({
        id: 'solicitud-pendiente',
        solicitanteId: 'usuario-solicitante',
        estado: EstadoSolicitud.PENDIENTE,
      });
      const dto: CancelarSolicitudDto = {
        motivo: 'Ya no puedo retirarla',
      };

      repository.buscarPorId.mockResolvedValue(solicitudPendiente);
      repository.guardar.mockResolvedValue(solicitudPendiente);

      const resultado = await service.cancelarSolicitud(
        solicitudPendiente.id,
        'usuario-solicitante',
        dto,
      );

      expect(solicitudPendiente.estado).toBe(EstadoSolicitud.CANCELADA);
      expect(solicitudPendiente.motivoCancelacion).toBe(dto.motivo);
      expect(repository.guardar).toHaveBeenCalledWith(solicitudPendiente);
      expect(publicacionService.buscarPublicacionPorId).not.toHaveBeenCalled();
      expect(dataSource.transaction).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
      expect(resultado.estado).toBe(EstadoSolicitud.CANCELADA);
    });

    it('rechaza cancelar una solicitud pendiente cuando la acción no la realiza el solicitante', async () => {
      const solicitudPendiente = crearSolicitud({
        solicitanteId: 'usuario-solicitante',
        creadorPublicacionId: 'usuario-creador',
        estado: EstadoSolicitud.PENDIENTE,
      });

      repository.buscarPorId.mockResolvedValue(solicitudPendiente);

      await expect(
        service.cancelarSolicitud(solicitudPendiente.id, 'usuario-creador', {
          motivo: 'No corresponde',
        }),
      ).rejects.toThrow(
        'Solo el solicitante puede cancelar una solicitud pendiente',
      );

      expect(repository.guardar).not.toHaveBeenCalled();
      expect(dataSource.transaction).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('cancela una solicitud aceptada, libera la publicación y notifica', async () => {
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        titulo: 'Mesa de madera',
        estado: EstadoPublicacion.RESERVADA,
      });
      const solicitudAceptada = crearSolicitud({
        id: 'solicitud-aceptada',
        publicacionId: publicacion.id,
        creadorPublicacionId: 'usuario-creador',
        estado: EstadoSolicitud.ACEPTADA,
        publicacion,
      });
      const dto: CancelarSolicitudDto = {
        motivo: 'No se pudo coordinar la entrega',
      };

      repository.buscarPorId.mockResolvedValue(solicitudAceptada);
      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);

      const resultado = await service.cancelarSolicitud(
        solicitudAceptada.id,
        'usuario-creador',
        dto,
      );

      expect(publicacionService.buscarPublicacionPorId).toHaveBeenCalledWith(
        publicacion.id,
      );
      expect(dataSource.transaction).toHaveBeenCalledTimes(1);
      expect(manager.save).toHaveBeenNthCalledWith(1, publicacion);
      expect(manager.save).toHaveBeenNthCalledWith(2, solicitudAceptada);
      expect(publicacion.estado).toBe(EstadoPublicacion.DISPONIBLE);
      expect(solicitudAceptada.estado).toBe(EstadoSolicitud.CANCELADA);
      expect(solicitudAceptada.motivoCancelacion).toBe(dto.motivo);
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.SOLICITUD_ACEPTADA_CANCELADA,
        expect.objectContaining({
          solicitudId: solicitudAceptada.id,
          destinatarioId: solicitudAceptada.solicitanteId,
          publicacionTitulo: publicacion.titulo,
          motivo: dto.motivo,
        }),
      );
      expect(resultado.estado).toBe(EstadoSolicitud.CANCELADA);
    });

    it('usa motivo por defecto al cancelar una solicitud aceptada sin motivo', async () => {
      const publicacion = crearPublicacion({
        estado: EstadoPublicacion.RESERVADA,
      });
      const solicitudAceptada = crearSolicitud({
        estado: EstadoSolicitud.ACEPTADA,
        publicacionId: publicacion.id,
        creadorPublicacionId: 'usuario-creador',
      });

      repository.buscarPorId.mockResolvedValue(solicitudAceptada);
      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);

      await service.cancelarSolicitud(
        solicitudAceptada.id,
        'usuario-creador',
        {},
      );

      expect(solicitudAceptada.motivoCancelacion).toBe(
        'Solicitud cancelada luego de haber sido aceptada',
      );
      expect(eventEmitter.emit).toHaveBeenCalledWith(
        EventoDominio.SOLICITUD_ACEPTADA_CANCELADA,
        expect.objectContaining({
          motivo: 'Solicitud cancelada luego de haber sido aceptada',
        }),
      );
    });

    it('rechaza cancelar una solicitud aceptada cuando la acción no la realiza el creador', async () => {
      const solicitudAceptada = crearSolicitud({
        solicitanteId: 'usuario-solicitante',
        creadorPublicacionId: 'usuario-creador',
        estado: EstadoSolicitud.ACEPTADA,
      });

      repository.buscarPorId.mockResolvedValue(solicitudAceptada);

      await expect(
        service.cancelarSolicitud(
          solicitudAceptada.id,
          'usuario-solicitante',
          {},
        ),
      ).rejects.toThrow(
        'Solo el creador puede cancelar una solicitud aceptada',
      );

      expect(publicacionService.buscarPublicacionPorId).not.toHaveBeenCalled();
      expect(dataSource.transaction).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('rechaza cancelar solicitudes en estado final', async () => {
      const solicitudFinalizada = crearSolicitud({
        estado: EstadoSolicitud.FINALIZADA,
      });

      repository.buscarPorId.mockResolvedValue(solicitudFinalizada);

      await expect(
        service.cancelarSolicitud(
          solicitudFinalizada.id,
          'usuario-creador',
          {},
        ),
      ).rejects.toThrow(
        'Solo se pueden cancelar solicitudes pendientes o aceptadas',
      );

      expect(repository.guardar).not.toHaveBeenCalled();
      expect(dataSource.transaction).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('lanza NotFoundException si se intenta cancelar una solicitud inexistente', async () => {
      repository.buscarPorId.mockResolvedValue(null);

      await expect(
        service.cancelarSolicitud('solicitud-inexistente', 'usuario-1', {}),
      ).rejects.toThrow('Solicitud no encontrada');
    });

    it('no notifica si falla la transacción al cancelar una solicitud aceptada', async () => {
      const publicacion = crearPublicacion({
        estado: EstadoPublicacion.RESERVADA,
      });
      const solicitudAceptada = crearSolicitud({
        estado: EstadoSolicitud.ACEPTADA,
        publicacionId: publicacion.id,
        creadorPublicacionId: 'usuario-creador',
      });

      repository.buscarPorId.mockResolvedValue(solicitudAceptada);
      publicacionService.buscarPublicacionPorId.mockResolvedValue(publicacion);
      manager.save.mockRejectedValueOnce(new Error('Error al liberar reserva'));

      await expect(
        service.cancelarSolicitud(solicitudAceptada.id, 'usuario-creador', {}),
      ).rejects.toThrow('Error al liberar reserva');

      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });
  });

  describe('resolverSolicitudesPorPublicacionEliminada', () => {
    it('rechaza pendientes y cancela la aceptada cuando elimina moderación', async () => {
      const pendiente = crearSolicitud({
        id: 'pendiente-1',
        estado: EstadoSolicitud.PENDIENTE,
      });
      const aceptada = crearSolicitud({
        id: 'aceptada-1',
        estado: EstadoSolicitud.ACEPTADA,
      });

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
      const pendiente = crearSolicitud({
        id: 'pendiente-1',
        estado: EstadoSolicitud.PENDIENTE,
      });
      const aceptada = crearSolicitud({
        id: 'aceptada-1',
        estado: EstadoSolicitud.ACEPTADA,
      });

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
        crearSolicitud({
          id: 'rechazada-1',
          estado: EstadoSolicitud.RECHAZADA,
        }),
        crearSolicitud({
          id: 'cancelada-1',
          estado: EstadoSolicitud.CANCELADA,
        }),
        crearSolicitud({
          id: 'finalizada-1',
          estado: EstadoSolicitud.FINALIZADA,
        }),
        crearSolicitud({
          id: 'expirada-1',
          estado: EstadoSolicitud.EXPIRADA,
        }),
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
        'publicacion-1',
        'Publicación eliminada',
        true,
      );

      expect(cantidad).toBe(0);
      expect(repository.guardarVarias).not.toHaveBeenCalled();
      expect(eventEmitter.emit).not.toHaveBeenCalled();
    });

    it('no notifica si falla el guardado de las solicitudes', async () => {
      const pendiente = crearSolicitud({
        estado: EstadoSolicitud.PENDIENTE,
      });

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

  function crearRepositoryMock(): SolicitudRepositoryMock {
    return {
      crear: jest.fn<Solicitud, [Partial<Solicitud>]>(
        (datos: Partial<Solicitud>): Solicitud =>
          Object.assign(new Solicitud(), datos),
      ),

      guardar: jest.fn<Promise<Solicitud>, [Solicitud]>(
        (solicitud: Solicitud): Promise<Solicitud> =>
          Promise.resolve(solicitud),
      ),

      guardarVarias: jest.fn<Promise<Solicitud[]>, [Solicitud[]]>(
        (solicitudes: Solicitud[]): Promise<Solicitud[]> =>
          Promise.resolve(solicitudes),
      ),

      buscarPorId: jest.fn<Promise<Solicitud | null>, [string]>(),

      buscarSolicitudActiva: jest.fn<
        Promise<Solicitud | null>,
        [string, string]
      >(),

      listarMias: jest.fn<Promise<Solicitud[]>, [string]>(),

      listarRecibidas: jest.fn<Promise<Solicitud[]>, [string]>(),

      buscarPendientesPorPublicacion: jest.fn<Promise<Solicitud[]>, [string]>(),

      buscarActivasPorPublicacion: jest.fn<Promise<Solicitud[]>, [string]>(),

      buscarAceptadaPorPublicacion: jest.fn<
        Promise<Solicitud | null>,
        [string]
      >(),
    };
  }

  function crearPublicacionServiceMock(): PublicacionServiceMock {
    return {
      buscarPublicacionPorId: jest.fn<Promise<Publicacion>, [string]>(),
    };
  }

  function crearEventEmitterMock(): EventEmitterMock {
    return {
      emit: jest.fn<boolean, [string | symbol, ...unknown[]]>(() => true),
    };
  }

  function crearManagerMock(): ManagerMock {
    return {
      findOne: jest.fn<
        Promise<Solicitud | Publicacion | null>,
        [typeof Solicitud | typeof Publicacion, unknown]
      >(),

      find: jest.fn<Promise<Solicitud[]>, [typeof Solicitud, unknown]>(),

      save: jest.fn<
        Promise<Solicitud | Publicacion | Solicitud[]>,
        [Solicitud | Publicacion | Solicitud[]]
      >(
        (
          entidad: Solicitud | Publicacion | Solicitud[],
        ): Promise<Solicitud | Publicacion | Solicitud[]> =>
          Promise.resolve(entidad),
      ),
    };
  }

  function crearSolicitud(datos?: Partial<Solicitud>): Solicitud {
    const publicacion =
      datos?.publicacion ??
      crearPublicacion({
        id: datos?.publicacionId ?? 'publicacion-1',
        creadorId: datos?.creadorPublicacionId ?? 'usuario-creador',
      });

    return Object.assign(new Solicitud(), {
      id: 'solicitud-1',
      publicacionId: publicacion.id,
      publicacion,
      solicitanteId: 'usuario-solicitante',
      creadorPublicacionId: publicacion.creadorId,
      mensaje: null,
      estado: EstadoSolicitud.PENDIENTE,
      motivoRechazo: null,
      motivoCancelacion: null,
      version: 1,
      createdAt: new Date('2026-06-24T09:00:00.000Z'),
      updatedAt: new Date('2026-06-24T09:00:00.000Z'),
      ...datos,
    });
  }

  function crearPublicacion(datos?: Partial<Publicacion>): Publicacion {
    return Object.assign(new Publicacion(), {
      id: 'publicacion-1',
      creadorId: 'usuario-creador',
      titulo: 'Publicación de prueba',
      descripcion: 'Descripción suficientemente extensa para la publicación.',
      categoriaId: 'categoria-1',
      localidadId: 'localidad-1',
      imagenUrls: ['http://localhost:3000/uploads/publicaciones/imagen.jpg'],
      estado: EstadoPublicacion.DISPONIBLE,
      version: 1,
      createdAt: new Date('2026-06-24T09:00:00.000Z'),
      updatedAt: new Date('2026-06-24T09:00:00.000Z'),
      deletedAt: null,
      solicitudes: [],
      ...datos,
    });
  }

  function crearRespuesta(
    datos?: Partial<SolicitudResponseDto>,
  ): SolicitudResponseDto {
    return {
      id: 'solicitud-1',
      publicacionId: 'publicacion-1',
      solicitanteId: 'usuario-solicitante',
      creadorPublicacionId: 'usuario-creador',
      estado: EstadoSolicitud.PENDIENTE,
      mensaje: null,
      motivoRechazo: null,
      motivoCancelacion: null,
      createdAt: new Date('2026-06-24T09:00:00.000Z'),
      updatedAt: new Date('2026-06-24T09:00:00.000Z'),
      ...datos,
    };
  }
});
