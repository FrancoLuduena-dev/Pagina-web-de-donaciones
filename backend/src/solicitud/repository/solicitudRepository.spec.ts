import { FindManyOptions, FindOneOptions, In, Repository } from 'typeorm';

import { Solicitud } from '../entity/solicitudEntity';
import { EstadoSolicitud } from '../enums/estadoSolicitud';
import { SolicitudRepository } from './solicitudRepository';

type RepositoryMock = {
  create: jest.MockedFunction<(datos: Partial<Solicitud>) => Solicitud>;

  save: jest.MockedFunction<
    (solicitud: Solicitud | Solicitud[]) => Promise<Solicitud | Solicitud[]>
  >;

  findOne: jest.MockedFunction<
    (opciones: FindOneOptions<Solicitud>) => Promise<Solicitud | null>
  >;

  find: jest.MockedFunction<
    (opciones: FindManyOptions<Solicitud>) => Promise<Solicitud[]>
  >;
};

describe('SolicitudRepository', () => {
  const relacionesSolicitud = [
    'publicacion',
    'solicitante',
    'creadorPublicacion',
  ];

  let solicitudRepository: SolicitudRepository;
  let repository: RepositoryMock;

  beforeEach(() => {
    repository = crearRepositoryMock();

    solicitudRepository = new SolicitudRepository(
      repository as unknown as Repository<Solicitud>,
    );
  });

  describe('crear', () => {
    it('crea una instancia de Solicitud usando los datos recibidos sin guardarla', () => {
      const datos: Partial<Solicitud> = {
        publicacionId: 'publicacion-1',
        solicitanteId: 'usuario-solicitante',
        creadorPublicacionId: 'usuario-creador',
        mensaje: 'Me interesa la publicación',
      };

      const resultado = solicitudRepository.crear(datos);

      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(datos);
      expect(repository.save).not.toHaveBeenCalled();
      expect(resultado).toBeInstanceOf(Solicitud);
      expect(resultado).toMatchObject(datos);
    });
  });

  describe('guardar', () => {
    it('guarda y devuelve la solicitud persistida', async () => {
      const solicitud = crearSolicitud({ id: 'solicitud-1' });

      repository.save.mockResolvedValue(solicitud);

      await expect(solicitudRepository.guardar(solicitud)).resolves.toBe(
        solicitud,
      );

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(solicitud);
    });

    it('propaga errores de TypeORM al guardar', async () => {
      const solicitud = crearSolicitud();

      repository.save.mockRejectedValue(new Error('Error al guardar'));

      await expect(solicitudRepository.guardar(solicitud)).rejects.toThrow(
        'Error al guardar',
      );

      expect(repository.save).toHaveBeenCalledWith(solicitud);
    });
  });

  describe('guardarVarias', () => {
    it('guarda y devuelve varias solicitudes persistidas', async () => {
      const solicitudes = [
        crearSolicitud({ id: 'solicitud-1' }),
        crearSolicitud({ id: 'solicitud-2' }),
      ];

      repository.save.mockResolvedValue(solicitudes);

      await expect(
        solicitudRepository.guardarVarias(solicitudes),
      ).resolves.toBe(solicitudes);

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(solicitudes);
    });
  });

  describe('buscarPorId', () => {
    it('busca una solicitud por id con sus relaciones principales', async () => {
      const solicitud = crearSolicitud({ id: 'solicitud-1' });

      repository.findOne.mockResolvedValue(solicitud);

      await expect(
        solicitudRepository.buscarPorId('solicitud-1'),
      ).resolves.toBe(solicitud);

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'solicitud-1' },
        relations: relacionesSolicitud,
      });
    });

    it('devuelve null cuando no existe la solicitud', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        solicitudRepository.buscarPorId('solicitud-inexistente'),
      ).resolves.toBeNull();

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: 'solicitud-inexistente' },
        relations: relacionesSolicitud,
      });
    });
  });

  describe('buscarSolicitudActiva', () => {
    it('busca solicitudes pendientes o aceptadas para una publicación y solicitante', async () => {
      const solicitud = crearSolicitud({
        estado: EstadoSolicitud.PENDIENTE,
      });

      repository.findOne.mockResolvedValue(solicitud);

      await expect(
        solicitudRepository.buscarSolicitudActiva(
          'publicacion-1',
          'usuario-solicitante',
        ),
      ).resolves.toBe(solicitud);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          publicacionId: 'publicacion-1',
          solicitanteId: 'usuario-solicitante',
          estado: In([EstadoSolicitud.PENDIENTE, EstadoSolicitud.ACEPTADA]),
        },
        relations: relacionesSolicitud,
      });
    });
  });

  describe('listados', () => {
    it('lista solicitudes realizadas por el solicitante ordenadas por fecha descendente', async () => {
      const solicitudes = [crearSolicitud()];

      repository.find.mockResolvedValue(solicitudes);

      await expect(
        solicitudRepository.listarMias('usuario-solicitante'),
      ).resolves.toBe(solicitudes);

      expect(repository.find).toHaveBeenCalledWith({
        where: { solicitanteId: 'usuario-solicitante' },
        relations: relacionesSolicitud,
        order: { createdAt: 'DESC' },
      });
    });

    it('lista solicitudes recibidas por el creador ordenadas por fecha descendente', async () => {
      const solicitudes = [crearSolicitud()];

      repository.find.mockResolvedValue(solicitudes);

      await expect(
        solicitudRepository.listarRecibidas('usuario-creador'),
      ).resolves.toBe(solicitudes);

      expect(repository.find).toHaveBeenCalledWith({
        where: { creadorPublicacionId: 'usuario-creador' },
        relations: relacionesSolicitud,
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('búsquedas por publicación', () => {
    it('busca solicitudes pendientes de una publicación', async () => {
      const solicitudes = [
        crearSolicitud({ estado: EstadoSolicitud.PENDIENTE }),
      ];

      repository.find.mockResolvedValue(solicitudes);

      await expect(
        solicitudRepository.buscarPendientesPorPublicacion('publicacion-1'),
      ).resolves.toBe(solicitudes);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          publicacionId: 'publicacion-1',
          estado: EstadoSolicitud.PENDIENTE,
        },
        relations: relacionesSolicitud,
      });
    });

    it('busca solicitudes activas de una publicación', async () => {
      const solicitudes = [
        crearSolicitud({ estado: EstadoSolicitud.PENDIENTE }),
        crearSolicitud({ id: 'solicitud-2', estado: EstadoSolicitud.ACEPTADA }),
      ];

      repository.find.mockResolvedValue(solicitudes);

      await expect(
        solicitudRepository.buscarActivasPorPublicacion('publicacion-1'),
      ).resolves.toBe(solicitudes);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          publicacionId: 'publicacion-1',
          estado: In([EstadoSolicitud.PENDIENTE, EstadoSolicitud.ACEPTADA]),
        },
        relations: relacionesSolicitud,
      });
    });

    it('busca la solicitud aceptada de una publicación', async () => {
      const solicitud = crearSolicitud({ estado: EstadoSolicitud.ACEPTADA });

      repository.findOne.mockResolvedValue(solicitud);

      await expect(
        solicitudRepository.buscarAceptadaPorPublicacion('publicacion-1'),
      ).resolves.toBe(solicitud);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          publicacionId: 'publicacion-1',
          estado: EstadoSolicitud.ACEPTADA,
        },
        relations: relacionesSolicitud,
      });
    });
  });

  function crearRepositoryMock(): RepositoryMock {
    return {
      create: jest.fn((datos: Partial<Solicitud>) =>
        Object.assign(new Solicitud(), datos),
      ),

      save: jest.fn((solicitud: Solicitud | Solicitud[]) =>
        Promise.resolve(solicitud),
      ),

      findOne: jest.fn(),

      find: jest.fn(),
    };
  }

  function crearSolicitud(datos?: Partial<Solicitud>): Solicitud {
    return Object.assign(new Solicitud(), {
      id: 'solicitud-1',
      publicacionId: 'publicacion-1',
      solicitanteId: 'usuario-solicitante',
      creadorPublicacionId: 'usuario-creador',
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
});
