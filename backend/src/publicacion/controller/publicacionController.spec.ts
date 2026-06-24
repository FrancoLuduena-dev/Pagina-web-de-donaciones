import type { RequestConUsuario } from 'src/compartidos/tipo/requestConUsuario';
import { rolUsuario } from 'src/usuario/enums/rolUsuario';

import { CrearPublicacionDto } from '../dtos/crearPublicacionDto';
import { EditarPublicacionDto } from '../dtos/editarPublicacionDto';
import { FiltrosPublicacionDto } from '../dtos/filtrosPublicacionDto';
import { CondicionObjeto } from '../enums/condicionObjeto';
import { EstadoPublicacion } from '../enums/estadoPublicacion';
import { Publicacion } from '../entity/publicacionEntity';
import { PublicacionService, type PublicacionConCreador } from '../service/publicacionService';
import { PublicacionController } from './publicacionController';

type PublicacionServiceMock = jest.Mocked<
  Pick<
    PublicacionService,
    | 'crearPublicacion'
    | 'listarPublico'
    | 'listarMisPublicaciones'
    | 'buscarPublicacionPorIdConCreador'
    | 'pausar'
    | 'reactivar'
    | 'eliminar'
    | 'editar'
  >
>;

const CREADOR_ID = '33333333-3333-4333-8333-333333333333';
const PUBLICACION_ID = '11111111-1111-4111-8111-111111111111';

const crearRequest = (
  overrides: Partial<RequestConUsuario['user']> = {},
): RequestConUsuario =>
  ({
    user: {
      id: CREADOR_ID,
      rol: rolUsuario.usuarioNormal,
      ...overrides,
    },
  }) as RequestConUsuario;

describe('PublicacionController', () => {
  let controller: PublicacionController;
  let publicacionService: PublicacionServiceMock;

  beforeEach(() => {
    publicacionService = {
      crearPublicacion: jest.fn(),
      listarPublico: jest.fn(),
      listarMisPublicaciones: jest.fn(),
      buscarPublicacionPorIdConCreador: jest.fn(),
      pausar: jest.fn(),
      reactivar: jest.fn(),
      eliminar: jest.fn(),
      editar: jest.fn(),
    };

    controller = new PublicacionController(
      publicacionService as unknown as PublicacionService,
    );
  });

  it('se instancia con sus dependencias', () => {
    expect(controller).toBeDefined();
  });

  it('delega el listado público al servicio con los filtros recibidos', async () => {
    const filtros: FiltrosPublicacionDto = { q: 'mesa' };
    const publicaciones = [] as Publicacion[];

    publicacionService.listarPublico.mockResolvedValue(publicaciones);

    await expect(controller.listarFeedPublico(filtros)).resolves.toBe(
      publicaciones,
    );
    expect(publicacionService.listarPublico).toHaveBeenCalledWith(filtros);
  });

  it('delega la creación al servicio con el dto y el usuario autenticado', async () => {
    const dto = crearDto();
    const publicacion = { id: PUBLICACION_ID } as Publicacion;
    const req = crearRequest();

    publicacionService.crearPublicacion.mockResolvedValue(publicacion);

    await expect(controller.crearPublicacion(dto, req)).resolves.toBe(
      publicacion,
    );
    expect(publicacionService.crearPublicacion).toHaveBeenCalledWith(
      dto,
      CREADOR_ID,
    );
  });

  it('delega el listado de mis publicaciones al servicio', async () => {
    const publicaciones = [{ id: PUBLICACION_ID }] as Publicacion[];
    const req = crearRequest();

    publicacionService.listarMisPublicaciones.mockResolvedValue(publicaciones);

    await expect(
      controller.listarMisPublicaciones(req, EstadoPublicacion.PAUSADA),
    ).resolves.toBe(publicaciones);
    expect(publicacionService.listarMisPublicaciones).toHaveBeenCalledWith(
      CREADOR_ID,
      EstadoPublicacion.PAUSADA,
    );
  });

  it('delega la búsqueda por id con datos del creador', async () => {
    const publicacion = {
      id: PUBLICACION_ID,
      creadorNombreUsuario: 'juan',
      creadorNombreCompleto: 'Juan Pérez',
    } as PublicacionConCreador;

    publicacionService.buscarPublicacionPorIdConCreador.mockResolvedValue(
      publicacion,
    );

    await expect(
      controller.buscarPublicacionPorId(PUBLICACION_ID),
    ).resolves.toBe(publicacion);
    expect(
      publicacionService.buscarPublicacionPorIdConCreador,
    ).toHaveBeenCalledWith(PUBLICACION_ID);
  });

  it('delega pausar al servicio con id, usuario y rol', async () => {
    const publicacion = { id: PUBLICACION_ID } as Publicacion;
    const req = crearRequest({ rol: rolUsuario.usuarioModerador });

    publicacionService.pausar.mockResolvedValue(publicacion);

    await expect(controller.pausar(PUBLICACION_ID, req)).resolves.toBe(
      publicacion,
    );
    expect(publicacionService.pausar).toHaveBeenCalledWith(
      PUBLICACION_ID,
      CREADOR_ID,
      rolUsuario.usuarioModerador,
    );
  });

  it('delega reactivar al servicio con id, usuario y rol', async () => {
    const publicacion = { id: PUBLICACION_ID } as Publicacion;
    const req = crearRequest();

    publicacionService.reactivar.mockResolvedValue(publicacion);

    await expect(controller.reactivar(PUBLICACION_ID, req)).resolves.toBe(
      publicacion,
    );
    expect(publicacionService.reactivar).toHaveBeenCalledWith(
      PUBLICACION_ID,
      CREADOR_ID,
      rolUsuario.usuarioNormal,
    );
  });

  it('delega eliminar al servicio con id, usuario y rol', async () => {
    const publicacion = { id: PUBLICACION_ID } as Publicacion;
    const req = crearRequest({ rol: rolUsuario.usuarioAdministrador });

    publicacionService.eliminar.mockResolvedValue(publicacion);

    await expect(controller.eliminar(PUBLICACION_ID, req)).resolves.toBe(
      publicacion,
    );
    expect(publicacionService.eliminar).toHaveBeenCalledWith(
      PUBLICACION_ID,
      CREADOR_ID,
      rolUsuario.usuarioAdministrador,
    );
  });

  it('delega editar al servicio con id, dto y usuario autenticado', async () => {
    const dto = Object.assign(new EditarPublicacionDto(), {
      titulo: 'Nuevo título',
    });
    const publicacion = { id: PUBLICACION_ID } as Publicacion;
    const req = crearRequest();

    publicacionService.editar.mockResolvedValue(publicacion);

    await expect(controller.editar(PUBLICACION_ID, dto, req)).resolves.toBe(
      publicacion,
    );
    expect(publicacionService.editar).toHaveBeenCalledWith(
      PUBLICACION_ID,
      dto,
      CREADOR_ID,
    );
  });

  function crearDto(): CrearPublicacionDto {
    return Object.assign(new CrearPublicacionDto(), {
      titulo: 'Mesa de comedor',
      descripcion: 'Mesa de comedor de madera en muy buen estado.',
      categoriaId: '44444444-4444-4444-8444-444444444444',
      localidadId: '55555555-5555-4555-8555-555555555555',
      condicion: CondicionObjeto.USADO_BUENO,
      imagenUrls: ['http://localhost:3000/uploads/publicaciones/imagen.jpg'],
    });
  }
});
