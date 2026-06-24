import {
  FindManyOptions,
  FindOneOptions,
  IsNull,
  Repository,
  UpdateResult,
} from 'typeorm';

import { TipoNotificacion } from '../enum/tipoNotificacion';
import { Notificacion } from '../entity/notificacionEntity';
import { NotificacionRepository } from './notificacionRepository';

type RepositoryMock = {
  create: jest.Mock<Notificacion, [Partial<Notificacion>]>;
  save: jest.Mock<Promise<Notificacion>, [Notificacion]>;
  findAndCount: jest.Mock<
    Promise<[Notificacion[], number]>,
    [FindManyOptions<Notificacion>]
  >;
  count: jest.Mock<Promise<number>, [FindManyOptions<Notificacion>]>;
  findOne: jest.Mock<
    Promise<Notificacion | null>,
    [FindOneOptions<Notificacion>]
  >;
  update: jest.Mock<
    Promise<UpdateResult>,
    [Partial<Notificacion>, Partial<Notificacion>]
  >;
};

describe('NotificacionRepository', () => {
  let notificacionRepository: NotificacionRepository;
  let repository: RepositoryMock;

  const fechaActual = new Date('2026-06-24T10:00:00.000Z');

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(fechaActual);

    repository = crearRepositoryMock();

    notificacionRepository = new NotificacionRepository(
      repository as unknown as Repository<Notificacion>,
    );
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('crear', () => {
    it('crea una instancia de Notificacion usando los datos recibidos sin guardarla', () => {
      const datos: Partial<Notificacion> = {
        destinatarioId: 'usuario-1',
        tipo: TipoNotificacion.SOLICITUD_CREADA,
        titulo: 'Nueva solicitud',
        mensaje: 'Recibiste una nueva solicitud.',
        solicitudId: 'solicitud-1',
        publicacionId: null,
        denunciaId: null,
        leidaEn: null,
      };

      const resultado = notificacionRepository.crear(datos);

      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(datos);
      expect(repository.save).not.toHaveBeenCalled();
      expect(resultado).toBeInstanceOf(Notificacion);
      expect(resultado).toMatchObject(datos);
    });

    it('permite crear una notificación sin referencia asociada', () => {
      const datos: Partial<Notificacion> = {
        destinatarioId: 'usuario-1',
        tipo: TipoNotificacion.USUARIO_BLOQUEADO,
        titulo: 'Usuario bloqueado',
        mensaje: 'Tu usuario fue bloqueado.',
        solicitudId: null,
        publicacionId: null,
        denunciaId: null,
      };

      const resultado = notificacionRepository.crear(datos);

      expect(repository.create).toHaveBeenCalledWith(datos);
      expect(resultado.solicitudId).toBeNull();
      expect(resultado.publicacionId).toBeNull();
      expect(resultado.denunciaId).toBeNull();
    });
  });

  describe('guardar', () => {
    it('guarda y devuelve la notificación persistida', async () => {
      const notificacion = crearNotificacion({
        id: 'notificacion-1',
        titulo: 'Nueva solicitud',
      });

      repository.save.mockResolvedValue(notificacion);

      await expect(notificacionRepository.guardar(notificacion)).resolves.toBe(
        notificacion,
      );

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(notificacion);
    });

    it('propaga el error si TypeORM falla al guardar', async () => {
      const notificacion = crearNotificacion();

      repository.save.mockRejectedValue(new Error('Error al guardar'));

      await expect(
        notificacionRepository.guardar(notificacion),
      ).rejects.toThrow('Error al guardar');

      expect(repository.save).toHaveBeenCalledWith(notificacion);
    });
  });

  describe('listarPorDestinatario', () => {
    it('lista notificaciones del destinatario ordenadas de más nuevas a más viejas con relaciones necesarias', async () => {
      const notificaciones = [
        crearNotificacion({ id: 'notificacion-1' }),
        crearNotificacion({ id: 'notificacion-2' }),
      ];

      repository.findAndCount.mockResolvedValue([notificaciones, 2]);

      await expect(
        notificacionRepository.listarPorDestinatario('usuario-1', 1, 20),
      ).resolves.toEqual([notificaciones, 2]);

      expect(repository.findAndCount).toHaveBeenCalledTimes(1);
      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { destinatarioId: 'usuario-1' },
        relations: ['solicitud', 'denuncia'],
        order: { creadaEn: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('calcula correctamente el offset para páginas posteriores', async () => {
      repository.findAndCount.mockResolvedValue([[], 45]);

      await notificacionRepository.listarPorDestinatario('usuario-1', 3, 10);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { destinatarioId: 'usuario-1' },
        relations: ['solicitud', 'denuncia'],
        order: { creadaEn: 'DESC' },
        skip: 20,
        take: 10,
      });
    });

    it('devuelve lista vacía y total cero cuando no hay notificaciones', async () => {
      repository.findAndCount.mockResolvedValue([[], 0]);

      await expect(
        notificacionRepository.listarPorDestinatario(
          'usuario-sin-datos',
          1,
          20,
        ),
      ).resolves.toEqual([[], 0]);

      expect(repository.findAndCount).toHaveBeenCalledWith({
        where: { destinatarioId: 'usuario-sin-datos' },
        relations: ['solicitud', 'denuncia'],
        order: { creadaEn: 'DESC' },
        skip: 0,
        take: 20,
      });
    });

    it('propaga el error si TypeORM falla al listar', async () => {
      repository.findAndCount.mockRejectedValue(new Error('Error al listar'));

      await expect(
        notificacionRepository.listarPorDestinatario('usuario-1', 1, 20),
      ).rejects.toThrow('Error al listar');

      expect(repository.findAndCount).toHaveBeenCalledTimes(1);
    });
  });

  describe('contarNoLeidas', () => {
    it('cuenta solo notificaciones no leídas del destinatario', async () => {
      repository.count.mockResolvedValue(4);

      await expect(
        notificacionRepository.contarNoLeidas('usuario-1'),
      ).resolves.toBe(4);

      expect(repository.count).toHaveBeenCalledTimes(1);
      expect(repository.count).toHaveBeenCalledWith({
        where: {
          destinatarioId: 'usuario-1',
          leidaEn: IsNull(),
        },
      });
    });

    it('devuelve cero cuando el destinatario no tiene notificaciones no leídas', async () => {
      repository.count.mockResolvedValue(0);

      await expect(
        notificacionRepository.contarNoLeidas('usuario-1'),
      ).resolves.toBe(0);

      expect(repository.count).toHaveBeenCalledWith({
        where: {
          destinatarioId: 'usuario-1',
          leidaEn: IsNull(),
        },
      });
    });

    it('propaga el error si TypeORM falla al contar', async () => {
      repository.count.mockRejectedValue(new Error('Error al contar'));

      await expect(
        notificacionRepository.contarNoLeidas('usuario-1'),
      ).rejects.toThrow('Error al contar');

      expect(repository.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('buscarPorIdYDestinatario', () => {
    it('busca una notificación por id y destinatario cargando relaciones necesarias', async () => {
      const notificacion = crearNotificacion({
        id: 'notificacion-1',
        destinatarioId: 'usuario-1',
      });

      repository.findOne.mockResolvedValue(notificacion);

      await expect(
        notificacionRepository.buscarPorIdYDestinatario(
          'notificacion-1',
          'usuario-1',
        ),
      ).resolves.toBe(notificacion);

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'notificacion-1',
          destinatarioId: 'usuario-1',
        },
        relations: ['solicitud', 'denuncia'],
      });
    });

    it('devuelve null cuando no existe la notificación para ese destinatario', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        notificacionRepository.buscarPorIdYDestinatario(
          'notificacion-inexistente',
          'usuario-1',
        ),
      ).resolves.toBeNull();

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'notificacion-inexistente',
          destinatarioId: 'usuario-1',
        },
        relations: ['solicitud', 'denuncia'],
      });
    });

    it('siempre filtra también por destinatario para evitar leer notificaciones ajenas', async () => {
      repository.findOne.mockResolvedValue(null);

      await notificacionRepository.buscarPorIdYDestinatario(
        'notificacion-de-otro',
        'usuario-actual',
      );

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'notificacion-de-otro',
          destinatarioId: 'usuario-actual',
        },
        relations: ['solicitud', 'denuncia'],
      });
    });

    it('propaga el error si TypeORM falla al buscar', async () => {
      repository.findOne.mockRejectedValue(new Error('Error al buscar'));

      await expect(
        notificacionRepository.buscarPorIdYDestinatario(
          'notificacion-1',
          'usuario-1',
        ),
      ).rejects.toThrow('Error al buscar');

      expect(repository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('marcarTodasComoLeidas', () => {
    it('marca como leídas solo las notificaciones no leídas del destinatario', async () => {
      await expect(
        notificacionRepository.marcarTodasComoLeidas('usuario-1'),
      ).resolves.toBeUndefined();

      expect(repository.update).toHaveBeenCalledTimes(1);
      expect(repository.update).toHaveBeenCalledWith(
        {
          destinatarioId: 'usuario-1',
          leidaEn: IsNull(),
        },
        {
          leidaEn: fechaActual,
        },
      );
    });

    it('no actualiza notificaciones ya leídas porque filtra por leidaEn null', async () => {
      await notificacionRepository.marcarTodasComoLeidas('usuario-1');

      expect(repository.update).toHaveBeenCalledWith(
        {
          destinatarioId: 'usuario-1',
          leidaEn: IsNull(),
        },
        {
          leidaEn: fechaActual,
        },
      );
    });

    it('propaga el error si TypeORM falla al marcar todas como leídas', async () => {
      repository.update.mockRejectedValue(new Error('Error al actualizar'));

      await expect(
        notificacionRepository.marcarTodasComoLeidas('usuario-1'),
      ).rejects.toThrow('Error al actualizar');

      expect(repository.update).toHaveBeenCalledTimes(1);
    });
  });

  function crearRepositoryMock(): RepositoryMock {
    const updateResult = new UpdateResult();
    updateResult.affected = 1;

    return {
      create: jest.fn<Notificacion, [Partial<Notificacion>]>(
        (datos: Partial<Notificacion>): Notificacion =>
          Object.assign(new Notificacion(), datos),
      ),

      save: jest.fn<Promise<Notificacion>, [Notificacion]>(
        (notificacion: Notificacion): Promise<Notificacion> =>
          Promise.resolve(notificacion),
      ),

      findAndCount: jest.fn<
        Promise<[Notificacion[], number]>,
        [FindManyOptions<Notificacion>]
      >(),

      count: jest.fn<Promise<number>, [FindManyOptions<Notificacion>]>(),

      findOne: jest.fn<
        Promise<Notificacion | null>,
        [FindOneOptions<Notificacion>]
      >(),

      update: jest
        .fn<
          Promise<UpdateResult>,
          [Partial<Notificacion>, Partial<Notificacion>]
        >()
        .mockResolvedValue(updateResult),
    };
  }

  function crearNotificacion(datos?: Partial<Notificacion>): Notificacion {
    return Object.assign(new Notificacion(), {
      id: 'notificacion-1',
      destinatarioId: 'usuario-1',
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
