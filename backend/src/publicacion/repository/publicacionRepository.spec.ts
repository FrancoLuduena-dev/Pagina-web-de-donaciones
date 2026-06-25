import { BadRequestException } from '@nestjs/common';
import {
  FindManyOptions,
  FindOneOptions,
  ILike,
  IsNull,
  Repository,
} from 'typeorm';

import { FiltrosPublicacionDto } from '../dtos/filtrosPublicacionDto';
import { Publicacion } from '../entity/publicacionEntity';
import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { PublicacionRepository } from './publicacionRepository';

type RepositoryMock = {
  create: jest.Mock<Publicacion, [Partial<Publicacion>]>;
  save: jest.Mock<Promise<Publicacion>, [Publicacion]>;
  findOne: jest.Mock<
    Promise<Publicacion | null>,
    [FindOneOptions<Publicacion>]
  >;
  find: jest.Mock<Promise<Publicacion[]>, [FindManyOptions<Publicacion>]>;
};

describe('PublicacionRepository', () => {
  let publicacionRepository: PublicacionRepository;
  let repository: RepositoryMock;

  beforeEach(() => {
    repository = crearRepositoryMock();

    publicacionRepository = new PublicacionRepository(
      repository as unknown as Repository<Publicacion>,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('crear', () => {
    it('crea una instancia de Publicacion usando los datos recibidos sin guardarla', () => {
      const datos: Partial<Publicacion> = {
        creadorId: 'usuario-1',
        titulo: 'Mesa de madera',
        descripcion: 'Mesa en buen estado',
        categoriaId: 'categoria-1',
        localidadId: 'localidad-1',
        condicion: CondicionObjeto.USADO_BUENO,
        imagenUrls: ['http://localhost:3000/uploads/publicaciones/mesa.png'],
      };

      const resultado = publicacionRepository.crear(datos);

      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.create).toHaveBeenCalledWith(datos);
      expect(repository.save).not.toHaveBeenCalled();
      expect(resultado).toBeInstanceOf(Publicacion);
      expect(resultado).toMatchObject(datos);
    });
  });

  describe('guardar', () => {
    it('guarda y devuelve la publicación persistida', async () => {
      const publicacion = crearPublicacion({ id: 'publicacion-1' });

      repository.save.mockResolvedValue(publicacion);

      await expect(publicacionRepository.guardar(publicacion)).resolves.toBe(
        publicacion,
      );

      expect(repository.save).toHaveBeenCalledTimes(1);
      expect(repository.save).toHaveBeenCalledWith(publicacion);
    });

    it('propaga el error si TypeORM falla al guardar', async () => {
      const publicacion = crearPublicacion();

      repository.save.mockRejectedValue(new Error('Error al guardar'));

      await expect(publicacionRepository.guardar(publicacion)).rejects.toThrow(
        'Error al guardar',
      );

      expect(repository.save).toHaveBeenCalledWith(publicacion);
    });
  });

  describe('buscarPorId', () => {
    it('busca por id excluyendo publicaciones eliminadas lógicamente', async () => {
      const publicacion = crearPublicacion({
        id: 'publicacion-1',
        deletedAt: undefined,
      });

      repository.findOne.mockResolvedValue(publicacion);

      await expect(
        publicacionRepository.buscarPorId('publicacion-1'),
      ).resolves.toBe(publicacion);

      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'publicacion-1',
          deletedAt: IsNull(),
        },
      });
    });

    it('devuelve null cuando no existe una publicación no eliminada con ese id', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(
        publicacionRepository.buscarPorId('publicacion-inexistente'),
      ).resolves.toBeNull();

      expect(repository.findOne).toHaveBeenCalledWith({
        where: {
          id: 'publicacion-inexistente',
          deletedAt: IsNull(),
        },
      });
    });

    it('propaga el error si TypeORM falla al buscar por id', async () => {
      repository.findOne.mockRejectedValue(new Error('Error al buscar'));

      await expect(
        publicacionRepository.buscarPorId('publicacion-1'),
      ).rejects.toThrow('Error al buscar');

      expect(repository.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('listarPublico', () => {
    it('lista publicaciones disponibles por defecto, excluyendo eliminadas y ordenando por fecha descendente', async () => {
      const publicaciones = [crearPublicacion()];

      repository.find.mockResolvedValue(publicaciones);

      await expect(publicacionRepository.listarPublico({})).resolves.toBe(
        publicaciones,
      );

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          estado: EstadoPublicacion.DISPONIBLE,
          deletedAt: IsNull(),
        },
        order: {
          createdAt: 'DESC',
        },
      });
    });

    it('permite filtrar por estado no eliminado', async () => {
      repository.find.mockResolvedValue([]);

      await publicacionRepository.listarPublico({
        estado: EstadoPublicacion.PAUSADA,
      });

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          estado: EstadoPublicacion.PAUSADA,
          deletedAt: IsNull(),
        },
        order: {
          createdAt: 'DESC',
        },
      });
    });

    it('rechaza listar publicaciones eliminadas en el listado público', () => {
      expect(() =>
        publicacionRepository.listarPublico({
          estado: EstadoPublicacion.ELIMINADA,
        }),
      ).toThrow(BadRequestException);

      expect(() =>
        publicacionRepository.listarPublico({
          estado: EstadoPublicacion.ELIMINADA,
        }),
      ).toThrow(
        'Las publicaciones eliminadas no se muestran en el listado público',
      );

      expect(repository.find).not.toHaveBeenCalled();
    });

    it('aplica filtros de categoría, localidad y condición', async () => {
      repository.find.mockResolvedValue([]);

      const filtros: FiltrosPublicacionDto = {
        categoriaId: 'categoria-1',
        localidadId: 'localidad-1',
        condicion: CondicionObjeto.USADO_REGULAR,
      };

      await publicacionRepository.listarPublico(filtros);

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          estado: EstadoPublicacion.DISPONIBLE,
          deletedAt: IsNull(),
          categoriaId: 'categoria-1',
          localidadId: 'localidad-1',
          condicion: CondicionObjeto.USADO_REGULAR,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    });

    it('ignora q cuando solo contiene espacios', async () => {
      repository.find.mockResolvedValue([]);

      await publicacionRepository.listarPublico({
        q: '     ',
        categoriaId: 'categoria-1',
      });

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          estado: EstadoPublicacion.DISPONIBLE,
          deletedAt: IsNull(),
          categoriaId: 'categoria-1',
        },
        order: {
          createdAt: 'DESC',
        },
      });
    });

    it('busca texto por título y descripción manteniendo filtros base', async () => {
      repository.find.mockResolvedValue([]);

      await publicacionRepository.listarPublico({
        q: '  mesa  ',
        categoriaId: 'categoria-1',
        localidadId: 'localidad-1',
        condicion: CondicionObjeto.USADO_BUENO,
        estado: EstadoPublicacion.PAUSADA,
      });

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: [
          {
            estado: EstadoPublicacion.PAUSADA,
            deletedAt: IsNull(),
            categoriaId: 'categoria-1',
            localidadId: 'localidad-1',
            condicion: CondicionObjeto.USADO_BUENO,
            titulo: ILike('%mesa%'),
          },
          {
            estado: EstadoPublicacion.PAUSADA,
            deletedAt: IsNull(),
            categoriaId: 'categoria-1',
            localidadId: 'localidad-1',
            condicion: CondicionObjeto.USADO_BUENO,
            descripcion: ILike('%mesa%'),
          },
        ],
        order: {
          createdAt: 'DESC',
        },
      });
    });

    it('propaga errores de TypeORM al listar público', async () => {
      repository.find.mockRejectedValue(new Error('Error al listar'));

      await expect(publicacionRepository.listarPublico({})).rejects.toThrow(
        'Error al listar',
      );

      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('listarPorCreador', () => {
    it('lista publicaciones de un creador sin filtrar por estado cuando no se recibe estado', async () => {
      const publicaciones = [
        crearPublicacion({
          creadorId: 'usuario-1',
        }),
      ];

      repository.find.mockResolvedValue(publicaciones);

      await expect(
        publicacionRepository.listarPorCreador('usuario-1'),
      ).resolves.toBe(publicaciones);

      expect(repository.find).toHaveBeenCalledTimes(1);
      expect(repository.find).toHaveBeenCalledWith({
        where: {
          creadorId: 'usuario-1',
        },
        order: {
          createdAt: 'DESC',
        },
      });
    });

    it('lista publicaciones de un creador filtrando por estado', async () => {
      repository.find.mockResolvedValue([]);

      await publicacionRepository.listarPorCreador(
        'usuario-1',
        EstadoPublicacion.PAUSADA,
      );

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          creadorId: 'usuario-1',
          estado: EstadoPublicacion.PAUSADA,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    });

    it('permite listar publicaciones eliminadas del propio creador si se pide ese estado explícitamente', async () => {
      repository.find.mockResolvedValue([]);

      await publicacionRepository.listarPorCreador(
        'usuario-1',
        EstadoPublicacion.ELIMINADA,
      );

      expect(repository.find).toHaveBeenCalledWith({
        where: {
          creadorId: 'usuario-1',
          estado: EstadoPublicacion.ELIMINADA,
        },
        order: {
          createdAt: 'DESC',
        },
      });
    });

    it('propaga errores de TypeORM al listar por creador', async () => {
      repository.find.mockRejectedValue(new Error('Error al listar creador'));

      await expect(
        publicacionRepository.listarPorCreador('usuario-1'),
      ).rejects.toThrow('Error al listar creador');

      expect(repository.find).toHaveBeenCalledTimes(1);
    });
  });

  function crearRepositoryMock(): RepositoryMock {
    return {
      create: jest.fn<Publicacion, [Partial<Publicacion>]>(
        (datos: Partial<Publicacion>): Publicacion =>
          Object.assign(new Publicacion(), datos),
      ),

      save: jest.fn<Promise<Publicacion>, [Publicacion]>(
        (publicacion: Publicacion): Promise<Publicacion> =>
          Promise.resolve(publicacion),
      ),

      findOne: jest.fn<
        Promise<Publicacion | null>,
        [FindOneOptions<Publicacion>]
      >(),

      find: jest.fn<Promise<Publicacion[]>, [FindManyOptions<Publicacion>]>(),
    };
  }

  function crearPublicacion(datos?: Partial<Publicacion>): Publicacion {
    return Object.assign(new Publicacion(), {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      creadorId: 'usuario-1',
      titulo: 'Mesa de madera',
      descripcion: 'Mesa de madera en buen estado para donar.',
      categoriaId: 'categoria-1',
      localidadId: 'localidad-1',
      condicion: CondicionObjeto.USADO_BUENO,
      imagenUrls: ['http://localhost:3000/uploads/publicaciones/mesa.webp'],
      estado: EstadoPublicacion.DISPONIBLE,
      version: 1,
      createdAt: new Date('2026-06-24T09:00:00.000Z'),
      updatedAt: new Date('2026-06-24T09:00:00.000Z'),
      deletedAt: undefined,
      solicitudes: [],
      ...datos,
    });
  }
});
