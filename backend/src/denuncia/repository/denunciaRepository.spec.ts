import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { FiltroDenunciaDto } from '../dtos/filtroDenunciaDto';
import { Denuncia } from '../entity/denunciaEntity';
import { EstadoDenuncia } from '../enums/estadoDenuncia';
import { MotivoDenuncia } from '../enums/motivoDenuncia';
import { DenunciaRepository } from './denunciaRepository';

type RepositoryMock = {
  create: jest.MockedFunction<(denuncia: Partial<Denuncia>) => Denuncia>;
  save: jest.MockedFunction<(denuncia: Denuncia) => Promise<Denuncia>>;
  findOne: jest.MockedFunction<
    (options: FindOneOptions<Denuncia>) => Promise<Denuncia | null>
  >;
  find: jest.MockedFunction<
    (options: FindManyOptions<Denuncia>) => Promise<Denuncia[]>
  >;
};

describe('DenunciaRepository', () => {
  let denunciaRepository: DenunciaRepository;
  let repository: RepositoryMock;

  beforeEach(() => {
    repository = {
      create: jest.fn(
        (denuncia: Partial<Denuncia>): Denuncia =>
          Object.assign(new Denuncia(), denuncia),
      ),
      save: jest.fn(
        (denuncia: Denuncia): Promise<Denuncia> => Promise.resolve(denuncia),
      ),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    denunciaRepository = new DenunciaRepository(
      repository as unknown as Repository<Denuncia>,
    );
  });

  it('crea una instancia de Denuncia sin guardarla en base', () => {
    const datos: Partial<Denuncia> = {
      publicacionId: '11111111-1111-4111-8111-111111111111',
      denuncianteId: '22222222-2222-4222-8222-222222222222',
      creadorPublicacionId: '33333333-3333-4333-8333-333333333333',
      motivo: MotivoDenuncia.CONTENIDO_INAPROPIADO,
      comentario: 'Comentario de prueba',
      estado: EstadoDenuncia.PENDIENTE,
      version: 1,
    };

    const resultado = denunciaRepository.crear(datos);

    expect(repository.create).toHaveBeenCalledWith(datos);
    expect(repository.save).not.toHaveBeenCalled();
    expect(resultado).toBeInstanceOf(Denuncia);
    expect(resultado).toEqual(expect.objectContaining(datos));
  });

  it('guarda una denuncia delegando en TypeORM', async () => {
    const denuncia = crearDenuncia();

    await expect(denunciaRepository.guardar(denuncia)).resolves.toBe(denuncia);

    expect(repository.save).toHaveBeenCalledWith(denuncia);
  });

  it('propaga errores al guardar una denuncia', async () => {
    const denuncia = crearDenuncia();
    repository.save.mockRejectedValue(new Error('Error al guardar denuncia'));

    await expect(denunciaRepository.guardar(denuncia)).rejects.toThrow(
      'Error al guardar denuncia',
    );
  });

  it('busca una denuncia por id usando el campo id', async () => {
    const denuncia = crearDenuncia();
    repository.findOne.mockResolvedValue(denuncia);

    const resultado = await denunciaRepository.buscarPorId(denuncia.id);

    expect(resultado).toBe(denuncia);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: denuncia.id },
    });
  });

  it('devuelve null cuando no encuentra denuncia por id', async () => {
    repository.findOne.mockResolvedValue(null);

    const resultado = await denunciaRepository.buscarPorId(
      '99999999-9999-4999-8999-999999999999',
    );

    expect(resultado).toBeNull();
  });

  it('busca denuncia duplicada por denunciante y publicación usando ambos campos', async () => {
    const denuncia = crearDenuncia();
    repository.findOne.mockResolvedValue(denuncia);

    const resultado = await denunciaRepository.buscarPorDenuncianteYPublicacion(
      denuncia.denuncianteId,
      denuncia.publicacionId,
    );

    expect(resultado).toBe(denuncia);
    expect(repository.findOne).toHaveBeenCalledWith({
      where: {
        denuncianteId: denuncia.denuncianteId,
        publicacionId: denuncia.publicacionId,
      },
    });
  });

  it('devuelve null si no existe denuncia para ese denunciante y publicación', async () => {
    repository.findOne.mockResolvedValue(null);

    const resultado = await denunciaRepository.buscarPorDenuncianteYPublicacion(
      '22222222-2222-4222-8222-222222222222',
      '11111111-1111-4111-8111-111111111111',
    );

    expect(resultado).toBeNull();
  });

  it('lista todas las denuncias cuando no recibe filtros', async () => {
    const denuncias = [
      crearDenuncia({ id: '11111111-1111-4111-8111-111111111111' }),
      crearDenuncia({ id: '22222222-2222-4222-8222-222222222222' }),
    ];
    repository.find.mockResolvedValue(denuncias);

    const resultado = await denunciaRepository.listar({});

    expect(resultado).toBe(denuncias);
    expect(repository.find).toHaveBeenCalledWith({
      where: {},
      order: {
        fechaCreacion: 'ASC',
      },
    });
  });

  it('lista denuncias filtrando solo por estado', async () => {
    const filtros: FiltroDenunciaDto = {
      estado: EstadoDenuncia.PENDIENTE,
    };
    repository.find.mockResolvedValue([]);

    await denunciaRepository.listar(filtros);

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        estado: EstadoDenuncia.PENDIENTE,
      },
      order: {
        fechaCreacion: 'ASC',
      },
    });
  });

  it('lista denuncias filtrando solo por publicación', async () => {
    const filtros: FiltroDenunciaDto = {
      publicacionId: '11111111-1111-4111-8111-111111111111',
    };
    repository.find.mockResolvedValue([]);

    await denunciaRepository.listar(filtros);

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        publicacionId: '11111111-1111-4111-8111-111111111111',
      },
      order: {
        fechaCreacion: 'ASC',
      },
    });
  });

  it('lista denuncias combinando estado y publicación', async () => {
    const filtros: FiltroDenunciaDto = {
      estado: EstadoDenuncia.EN_REVISION,
      publicacionId: '11111111-1111-4111-8111-111111111111',
    };
    repository.find.mockResolvedValue([]);

    await denunciaRepository.listar(filtros);

    expect(repository.find).toHaveBeenCalledWith({
      where: {
        estado: EstadoDenuncia.EN_REVISION,
        publicacionId: '11111111-1111-4111-8111-111111111111',
      },
      order: {
        fechaCreacion: 'ASC',
      },
    });
  });

  it('devuelve lista vacía cuando no hay denuncias para los filtros', async () => {
    repository.find.mockResolvedValue([]);

    const resultado = await denunciaRepository.listar({
      estado: EstadoDenuncia.RESUELTA,
    });

    expect(resultado).toEqual([]);
  });

  it('propaga errores al listar denuncias', async () => {
    repository.find.mockRejectedValue(new Error('Error consultando denuncias'));

    await expect(denunciaRepository.listar({})).rejects.toThrow(
      'Error consultando denuncias',
    );
  });

  function crearDenuncia(datos?: Partial<Denuncia>): Denuncia {
    return Object.assign(new Denuncia(), {
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      publicacionId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      denuncianteId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      creadorPublicacionId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
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
});
