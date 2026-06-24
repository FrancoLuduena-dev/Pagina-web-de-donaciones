import { BadRequestException } from '@nestjs/common';
import { FindManyOptions, FindOneOptions, IsNull, Repository } from 'typeorm';

import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { Publicacion } from '../entity/publicacionEntity';
import { PublicacionRepository } from './publicacionRepository';

type RepositoryMock = {
  create: jest.MockedFunction<
    (publicacion: Partial<Publicacion>) => Publicacion
  >;
  save: jest.MockedFunction<
    (publicacion: Publicacion) => Promise<Publicacion>
  >;
  findOne: jest.MockedFunction<
    (options: FindOneOptions<Publicacion>) => Promise<Publicacion | null>
  >;
  find: jest.MockedFunction<
    (options: FindManyOptions<Publicacion>) => Promise<Publicacion[]>
  >;
};

describe('PublicacionRepository', () => {
  let publicacionRepository: PublicacionRepository;
  let repository: RepositoryMock;

  beforeEach(() => {
    repository = {
      create: jest.fn(
        (publicacion: Partial<Publicacion>): Publicacion =>
          Object.assign(new Publicacion(), publicacion),
      ),
      save: jest.fn(
        (publicacion: Publicacion): Promise<Publicacion> =>
          Promise.resolve(publicacion),
      ),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    publicacionRepository = new PublicacionRepository(
      repository as unknown as Repository<Publicacion>,
    );
  });

  it('crea una instancia de Publicacion sin guardarla en base', () => {
    const datos: Partial<Publicacion> = {
      titulo: 'Silla',
      creadorId: '11111111-1111-4111-8111-111111111111',
    };

    const resultado = publicacionRepository.crear(datos);

    expect(repository.create).toHaveBeenCalledWith(datos);
    expect(repository.save).not.toHaveBeenCalled();
    expect(resultado).toBeInstanceOf(Publicacion);
  });

  it('busca por id excluyendo publicaciones con deletedAt', async () => {
    repository.findOne.mockResolvedValue(null);

    await publicacionRepository.buscarPorId(
      '11111111-1111-4111-8111-111111111111',
    );

    expect(repository.findOne).toHaveBeenCalledWith({
      where: {
        id: '11111111-1111-4111-8111-111111111111',
        deletedAt: IsNull(),
      },
    });
  });

  it('rechaza listar publicaciones eliminadas en el feed público', () => {
    expect(() =>
      publicacionRepository.listarPublico({
        estado: EstadoPublicacion.ELIMINADA,
      }),
    ).toThrow(BadRequestException);

    expect(repository.find).not.toHaveBeenCalled();
  });

  it('lista publicaciones disponibles por defecto en el feed público', async () => {
    repository.find.mockResolvedValue([]);

    await publicacionRepository.listarPublico({});

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        estado: EstadoPublicacion.DISPONIBLE,
        deletedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });
  });

  it('aplica filtros y búsqueda por texto en el feed público', async () => {
    repository.find.mockResolvedValue([]);

    await publicacionRepository.listarPublico({
      q: '  mesa  ',
      categoriaId: '22222222-2222-4222-8222-222222222222',
      condicion: CondicionObjeto.NUEVO,
      estado: EstadoPublicacion.PAUSADA,
    });

    expect(repository.find).toHaveBeenCalledWith({
      where: expect.arrayContaining([
        expect.objectContaining({
          estado: EstadoPublicacion.PAUSADA,
          deletedAt: IsNull(),
          categoriaId: '22222222-2222-4222-8222-222222222222',
          condicion: CondicionObjeto.NUEVO,
          titulo: expect.anything(),
        }),
        expect.objectContaining({
          estado: EstadoPublicacion.PAUSADA,
          deletedAt: IsNull(),
          categoriaId: '22222222-2222-4222-8222-222222222222',
          condicion: CondicionObjeto.NUEVO,
          descripcion: expect.anything(),
        }),
      ]),
      order: { createdAt: 'DESC' },
    });
  });

  it('lista publicaciones del creador incluyendo eliminadas para el historial', async () => {
    repository.find.mockResolvedValue([]);

    await publicacionRepository.listarPorCreador(
      '33333333-3333-4333-8333-333333333333',
    );

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        creadorId: '33333333-3333-4333-8333-333333333333',
      },
      order: { createdAt: 'DESC' },
    });
  });

  it('filtra mis publicaciones por estado cuando se indica', async () => {
    repository.find.mockResolvedValue([]);

    await publicacionRepository.listarPorCreador(
      '33333333-3333-4333-8333-333333333333',
      EstadoPublicacion.ENTREGADA,
    );

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        creadorId: '33333333-3333-4333-8333-333333333333',
        estado: EstadoPublicacion.ENTREGADA,
      },
      order: { createdAt: 'DESC' },
    });
  });
});
