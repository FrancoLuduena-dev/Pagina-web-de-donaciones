import { BadRequestException, NotFoundException } from '@nestjs/common';

import { PaginacionNotificacionDto } from '../dtos/paginacionNotificacionDto';
import { Notificacion } from '../entity/notificacionEntity';
import { TipoNotificacion } from '../enum/tipoNotificacion';
import { NotificacionRepository } from '../repository/notificacionRepository';
import { NotificacionService } from './notificacionService';

type NotificacionRepositoryMock = {
  crear: jest.Mock<Notificacion, [Partial<Notificacion>]>;
  guardar: jest.Mock<Promise<Notificacion>, [Notificacion]>;
  listarPorDestinatario: jest.Mock<
    Promise<[Notificacion[], number]>,
    [string, number, number]
  >;
  contarNoLeidas: jest.Mock<Promise<number>, [string]>;
  buscarPorIdYDestinatario: jest.Mock<
    Promise<Notificacion | null>,
    [string, string]
  >;
  marcarTodasComoLeidas: jest.Mock<Promise<void>, [string]>;
};

describe('NotificacionService', () => {
  let service: NotificacionService;
  let repository: NotificacionRepositoryMock;

  const fechaActual = new Date('2026-06-24T10:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);

    repository = crearRepositoryMock();

    service = new NotificacionService(
      repository as unknown as NotificacionRepository,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('crear', () => {
    it('crea una notificación sin referencias y setea referencias en null', async () => {
      const notificacion = crearNotificacion();

      repository.crear.mockReturnValue(notificacion);
      repository.guardar.mockResolvedValue(notificacion);

      const resultado = await service.crear({
        destinatarioId: notificacion.destinatarioId,
        tipo: notificacion.tipo,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
      });

      expect(repository.crear).toHaveBeenCalledTimes(1);
      expect(repository.crear).toHaveBeenCalledWith({
        destinatarioId: notificacion.destinatarioId,
        tipo: notificacion.tipo,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        solicitudId: null,
        publicacionId: null,
        denunciaId: null,
        leidaEn: null,
      });
      expect(repository.guardar).toHaveBeenCalledTimes(1);
      expect(repository.guardar).toHaveBeenCalledWith(notificacion);

      expect(resultado).toEqual({
        id: notificacion.id,
        tipo: notificacion.tipo,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        leida: false,
        leidaEn: null,
        solicitudId: null,
        publicacionId: null,
        denunciaId: null,
        creadaEn: notificacion.creadaEn,
      });
    });

    it('crea una notificación con referencia a solicitud', async () => {
      const notificacion = crearNotificacion({
        solicitudId: '22222222-2222-4222-8222-222222222222',
      });

      repository.crear.mockReturnValue(notificacion);
      repository.guardar.mockResolvedValue(notificacion);

      await service.crear({
        destinatarioId: notificacion.destinatarioId,
        tipo: notificacion.tipo,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        solicitudId: notificacion.solicitudId,
      });

      expect(repository.crear).toHaveBeenCalledWith({
        destinatarioId: notificacion.destinatarioId,
        tipo: notificacion.tipo,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        solicitudId: '22222222-2222-4222-8222-222222222222',
        publicacionId: null,
        denunciaId: null,
        leidaEn: null,
      });
    });

    it('crea una notificación con referencia a publicación', async () => {
      const notificacion = crearNotificacion({
        tipo: TipoNotificacion.PUBLICACION_ELIMINADA,
        solicitudId: null,
        publicacionId: '33333333-3333-4333-8333-333333333333',
      });

      repository.crear.mockReturnValue(notificacion);
      repository.guardar.mockResolvedValue(notificacion);

      await service.crear({
        destinatarioId: notificacion.destinatarioId,
        tipo: notificacion.tipo,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        publicacionId: notificacion.publicacionId,
      });

      expect(repository.crear).toHaveBeenCalledWith({
        destinatarioId: notificacion.destinatarioId,
        tipo: TipoNotificacion.PUBLICACION_ELIMINADA,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        solicitudId: null,
        publicacionId: '33333333-3333-4333-8333-333333333333',
        denunciaId: null,
        leidaEn: null,
      });
    });

    it('crea una notificación con referencia a denuncia', async () => {
      const notificacion = crearNotificacion({
        tipo: TipoNotificacion.DENUNCIA_RESUELTA,
        solicitudId: null,
        denunciaId: '44444444-4444-4444-8444-444444444444',
      });

      repository.crear.mockReturnValue(notificacion);
      repository.guardar.mockResolvedValue(notificacion);

      await service.crear({
        destinatarioId: notificacion.destinatarioId,
        tipo: notificacion.tipo,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        denunciaId: notificacion.denunciaId,
      });

      expect(repository.crear).toHaveBeenCalledWith({
        destinatarioId: notificacion.destinatarioId,
        tipo: TipoNotificacion.DENUNCIA_RESUELTA,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        solicitudId: null,
        publicacionId: null,
        denunciaId: '44444444-4444-4444-8444-444444444444',
        leidaEn: null,
      });
    });

    it('no cuenta referencias null como referencias válidas', async () => {
      const notificacion = crearNotificacion();

      repository.crear.mockReturnValue(notificacion);
      repository.guardar.mockResolvedValue(notificacion);

      await expect(
        service.crear({
          destinatarioId: notificacion.destinatarioId,
          tipo: notificacion.tipo,
          titulo: notificacion.titulo,
          mensaje: notificacion.mensaje,
          solicitudId: null,
          publicacionId: null,
          denunciaId: null,
        }),
      ).resolves.toEqual({
        id: notificacion.id,
        tipo: notificacion.tipo,
        titulo: notificacion.titulo,
        mensaje: notificacion.mensaje,
        leida: false,
        leidaEn: null,
        solicitudId: null,
        publicacionId: null,
        denunciaId: null,
        creadaEn: notificacion.creadaEn,
      });

      expect(repository.crear).toHaveBeenCalledTimes(1);
      expect(repository.guardar).toHaveBeenCalledTimes(1);
    });

    it('rechaza notificaciones con más de una referencia', async () => {
      await expect(
        service.crear({
          destinatarioId: '11111111-1111-4111-8111-111111111111',
          tipo: TipoNotificacion.PUBLICACION_ELIMINADA,
          titulo: 'Publicación eliminada',
          mensaje: 'Tu publicación fue eliminada.',
          solicitudId: '22222222-2222-4222-8222-222222222222',
          publicacionId: '33333333-3333-4333-8333-333333333333',
        }),
      ).rejects.toThrow(BadRequestException);

      expect(repository.crear).not.toHaveBeenCalled();
      expect(repository.guardar).not.toHaveBeenCalled();
    });

    it('rechaza notificaciones con solicitud, publicación y denuncia al mismo tiempo', async () => {
      await expect(
        service.crear({
          destinatarioId: '11111111-1111-4111-8111-111111111111',
          tipo: TipoNotificacion.DENUNCIA_RESUELTA,
          titulo: 'Denuncia resuelta',
          mensaje: 'Tu denuncia fue resuelta.',
          solicitudId: '22222222-2222-4222-8222-222222222222',
          publicacionId: '33333333-3333-4333-8333-333333333333',
          denunciaId: '44444444-4444-4444-8444-444444444444',
        }),
      ).rejects.toThrow(
        'Una notificación puede tener como máximo una referencia',
      );

      expect(repository.crear).not.toHaveBeenCalled();
      expect(repository.guardar).not.toHaveBeenCalled();
    });

    it('propaga errores del repository al guardar', async () => {
      const notificacion = crearNotificacion();

      repository.crear.mockReturnValue(notificacion);
      repository.guardar.mockRejectedValue(new Error('Error al guardar'));

      await expect(
        service.crear({
          destinatarioId: notificacion.destinatarioId,
          tipo: notificacion.tipo,
          titulo: notificacion.titulo,
          mensaje: notificacion.mensaje,
        }),
      ).rejects.toThrow('Error al guardar');

      expect(repository.crear).toHaveBeenCalledTimes(1);
      expect(repository.guardar).toHaveBeenCalledWith(notificacion);
    });
  });

  describe('listarPropias', () => {
    it('lista con página 1 y límite 20 por defecto', async () => {
      const notificaciones = [crearNotificacion()];
      const paginacion: PaginacionNotificacionDto = {};

      repository.listarPorDestinatario.mockResolvedValue([notificaciones, 1]);

      const resultado = await service.listarPropias(
        '11111111-1111-4111-8111-111111111111',
        paginacion,
      );

      expect(repository.listarPorDestinatario).toHaveBeenCalledTimes(1);
      expect(repository.listarPorDestinatario).toHaveBeenCalledWith(
        '11111111-1111-4111-8111-111111111111',
        1,
        20,
      );
      expect(resultado.total).toBe(1);
      expect(resultado.pagina).toBe(1);
      expect(resultado.limite).toBe(20);
      expect(resultado.totalPaginas).toBe(1);
      expect(resultado.notificaciones).toHaveLength(1);
      expect(resultado.notificaciones[0].id).toBe(notificaciones[0].id);
    });

    it('convierte paginación string a number y limita el máximo a 50', async () => {
      const paginacion: PaginacionNotificacionDto = {
        pagina: '3',
        limite: '100',
      };

      repository.listarPorDestinatario.mockResolvedValue([[], 120]);

      const resultado = await service.listarPropias(
        '11111111-1111-4111-8111-111111111111',
        paginacion,
      );

      expect(repository.listarPorDestinatario).toHaveBeenCalledWith(
        '11111111-1111-4111-8111-111111111111',
        3,
        50,
      );
      expect(resultado).toEqual({
        notificaciones: [],
        total: 120,
        pagina: 3,
        limite: 50,
        totalPaginas: 3,
      });
    });

    it('respeta límites menores a 50', async () => {
      const paginacion: PaginacionNotificacionDto = {
        pagina: '2',
        limite: '5',
      };

      repository.listarPorDestinatario.mockResolvedValue([[], 11]);

      const resultado = await service.listarPropias(
        '11111111-1111-4111-8111-111111111111',
        paginacion,
      );

      expect(repository.listarPorDestinatario).toHaveBeenCalledWith(
        '11111111-1111-4111-8111-111111111111',
        2,
        5,
      );
      expect(resultado.totalPaginas).toBe(3);
    });

    it('calcula totalPaginas en 0 cuando no hay notificaciones', async () => {
      const paginacion: PaginacionNotificacionDto = {
        pagina: '1',
        limite: '10',
      };

      repository.listarPorDestinatario.mockResolvedValue([[], 0]);

      const resultado = await service.listarPropias(
        '11111111-1111-4111-8111-111111111111',
        paginacion,
      );

      expect(resultado).toEqual({
        notificaciones: [],
        total: 0,
        pagina: 1,
        limite: 10,
        totalPaginas: 0,
      });
    });

    it('propaga errores del repository al listar', async () => {
      repository.listarPorDestinatario.mockRejectedValue(
        new Error('Error al listar'),
      );

      await expect(
        service.listarPropias('11111111-1111-4111-8111-111111111111', {}),
      ).rejects.toThrow('Error al listar');

      expect(repository.listarPorDestinatario).toHaveBeenCalledTimes(1);
    });
  });

  describe('contarNoLeidas', () => {
    it('cuenta notificaciones no leídas del destinatario', async () => {
      repository.contarNoLeidas.mockResolvedValue(7);

      await expect(
        service.contarNoLeidas('11111111-1111-4111-8111-111111111111'),
      ).resolves.toBe(7);

      expect(repository.contarNoLeidas).toHaveBeenCalledTimes(1);
      expect(repository.contarNoLeidas).toHaveBeenCalledWith(
        '11111111-1111-4111-8111-111111111111',
      );
    });

    it('propaga errores del repository al contar no leídas', async () => {
      repository.contarNoLeidas.mockRejectedValue(new Error('Error al contar'));

      await expect(
        service.contarNoLeidas('11111111-1111-4111-8111-111111111111'),
      ).rejects.toThrow('Error al contar');
    });
  });

  describe('marcarComoLeida', () => {
    it('marca como leída una notificación propia', async () => {
      const notificacion = crearNotificacion({ leidaEn: null });

      repository.buscarPorIdYDestinatario.mockResolvedValue(notificacion);
      repository.guardar.mockImplementation(
        (entidad: Notificacion): Promise<Notificacion> =>
          Promise.resolve(entidad),
      );

      const resultado = await service.marcarComoLeida(
        notificacion.id,
        notificacion.destinatarioId,
      );

      expect(repository.buscarPorIdYDestinatario).toHaveBeenCalledTimes(1);
      expect(repository.buscarPorIdYDestinatario).toHaveBeenCalledWith(
        notificacion.id,
        notificacion.destinatarioId,
      );
      expect(notificacion.leidaEn).toEqual(fechaActual);
      expect(repository.guardar).toHaveBeenCalledTimes(1);
      expect(repository.guardar).toHaveBeenCalledWith(notificacion);
      expect(resultado.leida).toBe(true);
      expect(resultado.leidaEn).toEqual(fechaActual);
    });

    it('no pisa leidaEn si la notificación ya estaba leída', async () => {
      const fechaLecturaOriginal = new Date('2026-06-20T10:00:00.000Z');
      const notificacion = crearNotificacion({
        leidaEn: fechaLecturaOriginal,
      });

      repository.buscarPorIdYDestinatario.mockResolvedValue(notificacion);
      repository.guardar.mockImplementation(
        (entidad: Notificacion): Promise<Notificacion> =>
          Promise.resolve(entidad),
      );

      const resultado = await service.marcarComoLeida(
        notificacion.id,
        notificacion.destinatarioId,
      );

      expect(notificacion.leidaEn).toBe(fechaLecturaOriginal);
      expect(resultado.leida).toBe(true);
      expect(resultado.leidaEn).toBe(fechaLecturaOriginal);
      expect(repository.guardar).toHaveBeenCalledWith(notificacion);
    });

    it('lanza NotFoundException si la notificación no existe o no pertenece al usuario', async () => {
      repository.buscarPorIdYDestinatario.mockResolvedValue(null);

      await expect(
        service.marcarComoLeida(
          'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          '11111111-1111-4111-8111-111111111111',
        ),
      ).rejects.toThrow(NotFoundException);

      expect(repository.buscarPorIdYDestinatario).toHaveBeenCalledWith(
        'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        '11111111-1111-4111-8111-111111111111',
      );
      expect(repository.guardar).not.toHaveBeenCalled();
    });

    it('propaga errores del repository al buscar la notificación', async () => {
      repository.buscarPorIdYDestinatario.mockRejectedValue(
        new Error('Error al buscar'),
      );

      await expect(
        service.marcarComoLeida(
          'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          '11111111-1111-4111-8111-111111111111',
        ),
      ).rejects.toThrow('Error al buscar');

      expect(repository.guardar).not.toHaveBeenCalled();
    });

    it('propaga errores del repository al guardar la notificación leída', async () => {
      const notificacion = crearNotificacion({ leidaEn: null });

      repository.buscarPorIdYDestinatario.mockResolvedValue(notificacion);
      repository.guardar.mockRejectedValue(new Error('Error al guardar'));

      await expect(
        service.marcarComoLeida(notificacion.id, notificacion.destinatarioId),
      ).rejects.toThrow('Error al guardar');

      expect(notificacion.leidaEn).toEqual(fechaActual);
      expect(repository.guardar).toHaveBeenCalledWith(notificacion);
    });
  });

  describe('marcarTodasComoLeidas', () => {
    it('marca todas como leídas delegando al repository', async () => {
      await expect(
        service.marcarTodasComoLeidas('11111111-1111-4111-8111-111111111111'),
      ).resolves.toBeUndefined();

      expect(repository.marcarTodasComoLeidas).toHaveBeenCalledTimes(1);
      expect(repository.marcarTodasComoLeidas).toHaveBeenCalledWith(
        '11111111-1111-4111-8111-111111111111',
      );
    });

    it('propaga errores del repository al marcar todas como leídas', async () => {
      repository.marcarTodasComoLeidas.mockRejectedValue(
        new Error('Error al actualizar'),
      );

      await expect(
        service.marcarTodasComoLeidas('11111111-1111-4111-8111-111111111111'),
      ).rejects.toThrow('Error al actualizar');

      expect(repository.marcarTodasComoLeidas).toHaveBeenCalledWith(
        '11111111-1111-4111-8111-111111111111',
      );
    });
  });

  function crearRepositoryMock(): NotificacionRepositoryMock {
    return {
      crear: jest.fn<Notificacion, [Partial<Notificacion>]>(
        (datos: Partial<Notificacion>): Notificacion =>
          Object.assign(new Notificacion(), datos),
      ),

      guardar: jest.fn<Promise<Notificacion>, [Notificacion]>(
        (notificacion: Notificacion): Promise<Notificacion> =>
          Promise.resolve(notificacion),
      ),

      listarPorDestinatario: jest.fn<
        Promise<[Notificacion[], number]>,
        [string, number, number]
      >(),

      contarNoLeidas: jest.fn<Promise<number>, [string]>(),

      buscarPorIdYDestinatario: jest.fn<
        Promise<Notificacion | null>,
        [string, string]
      >(),

      marcarTodasComoLeidas: jest.fn<Promise<void>, [string]>(
        (): Promise<void> => Promise.resolve(),
      ),
    };
  }

  function crearNotificacion(datos?: Partial<Notificacion>): Notificacion {
    return Object.assign(new Notificacion(), {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      destinatarioId: '11111111-1111-4111-8111-111111111111',
      tipo: TipoNotificacion.SOLICITUD_CREADA,
      titulo: 'Nueva solicitud',
      mensaje: 'Recibiste una nueva solicitud.',
      leidaEn: null,
      solicitudId: null,
      solicitud: null,
      publicacionId: null,
      publicacion: null,
      denunciaId: null,
      denuncia: null,
      creadaEn: new Date('2026-06-24T09:00:00.000Z'),
      ...datos,
    });
  }
});
